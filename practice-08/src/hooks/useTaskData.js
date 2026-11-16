import { useState, useEffect, useRef, useCallback } from 'react';

export function useTaskData({ api, filters }) {
  const [snapshot, setSnapshot] = useState({ tasks: [], categories: [], meta: { total: 0 } });
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);
  const [mutationError, setMutationError] = useState(null);
  const [pending, setPending] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const isMountedRef = useRef(true);
  const mutationLockRef = useRef(false);
  const mutationAbortRef = useRef(null);

  // Очистка при окончательном размонтировании компонента
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (mutationAbortRef.current) {
        mutationAbortRef.current.abort();
      }
    };
  }, []);

  // Эффект загрузки данных при изменении filters или вызове refresh / завершении мутации
  useEffect(() => {
    let active = true;
    const abortController = new AbortController();

    async function load() {
      try {
        const result = await api.loadInitialData(filters, { signal: abortController.signal });
        if (active && !abortController.signal.aborted) {
          setSnapshot(result);
          setStatus('ready');
          setError(null);
        }
      } catch (err) {
        if (active && !abortController.signal.aborted) {
          setStatus('error');
          setError(err);
        }
      }
    }

    load();

    return () => {
      active = false;
      abortController.abort();
    };
  }, [api, filters, reloadToken]);

  const refresh = useCallback(() => {
    setReloadToken(prev => prev + 1);
  }, []);

  // Единый исполнитель мутаций с защитой от двойного нажатия и поддержкой отмены
  const runMutation = useCallback(async actionFn => {
    if (mutationLockRef.current) {
      return false;
    }
    mutationLockRef.current = true;
    setPending(true);
    setMutationError(null);

    const abortController = new AbortController();
    mutationAbortRef.current = abortController;

    try {
      await actionFn({ signal: abortController.signal });
      if (!isMountedRef.current || abortController.signal.aborted) {
        return false;
      }
      mutationLockRef.current = false;
      setPending(false);
      setMutationError(null);
      // Запускаем повторный GET для синхронизации с актуальными данными
      setReloadToken(prev => prev + 1);
      return true;
    } catch (err) {
      mutationLockRef.current = false;
      setPending(false);
      if (!isMountedRef.current || abortController.signal.aborted) {
        return false;
      }
      setMutationError(err);
      return false;
    } finally {
      mutationAbortRef.current = null;
    }
  }, []);

  const saveTask = useCallback((id, value) => {
    return runMutation(options => {
      if (id !== null && id !== undefined) {
        return api.updateTask(id, value, options);
      }
      return api.createTask(value, options);
    });
  }, [api, runMutation]);

  const toggleTask = useCallback(task => {
    return runMutation(options => {
      return api.setTaskCompleted(task.id, !task.completed, options);
    });
  }, [api, runMutation]);

  const deleteTask = useCallback(id => {
    return runMutation(options => {
      return api.deleteTask(id, options);
    });
  }, [api, runMutation]);

  const resetData = useCallback(() => {
    return runMutation(options => {
      return api.resetDemoData(options);
    });
  }, [api, runMutation]);

  return {
    snapshot,
    status,
    error,
    mutationError,
    pending,
    refresh,
    saveTask,
    toggleTask,
    deleteTask,
    resetData,
  };
}
