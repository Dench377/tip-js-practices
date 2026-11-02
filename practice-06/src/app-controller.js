import { ApiError } from "./api-client.js";
import { validateTaskDraft } from "./form-validation.js";

export function messageForError(error) {
  if (!(error instanceof ApiError)) return "Не удалось выполнить операцию.";
  if (error.kind === "timeout") return "Сервер не ответил вовремя. Попробуйте ещё раз.";
  if (error.kind === "network") return "Нет соединения с учебным API. Проверьте, запущен ли npm start.";
  if (error.kind === "invalid-response") return "Сервер вернул ответ неожиданного формата.";
  if (error.kind === "http" && error.status === 404) return "Запись уже отсутствует на сервере. Обновите список.";
  if (error.kind === "http") return error.message || `Сервер вернул ошибку ${error.status}.`;
  return "Не удалось выполнить операцию.";
}

// view — адаптер из dom-app.js. Контроллер не должен обращаться к document.
// Обязательные методы результата:
// start, applyFilters, refresh, submit, beginEdit, cancelEdit,
// toggleTask, deleteTask, resetData и destroy.
export function createAppController({ api, view, validateDraft = validateTaskDraft } = {}) {
  if (!api || typeof api !== "object" || typeof api.loadInitialData !== "function" || typeof api.getTasks !== "function") {
    throw new TypeError("Некорректный объект api.");
  }
  if (!view || typeof view !== "object" || typeof view.setListState !== "function" || typeof view.setTasks !== "function") {
    throw new TypeError("Некорректный объект view.");
  }

  let currentTasks = [];
  let currentCategories = [];
  let currentFilters = {};
  let editingId = null;
  let activeAbortController = null;
  let loadSequence = 0;
  let categoriesLoaded = false;

  async function loadData(isInitial = false) {
    if (activeAbortController) {
      activeAbortController.abort();
    }
    activeAbortController = new AbortController();
    const signal = activeAbortController.signal;
    loadSequence += 1;
    const seq = loadSequence;

    view.setListState("loading");

    try {
      let result;
      if (isInitial || !categoriesLoaded) {
        result = await api.loadInitialData(currentFilters, { signal });
        if (seq !== loadSequence) return;
        currentCategories = result.categories ?? [];
        categoriesLoaded = true;
        view.setCategories(currentCategories);
      } else {
        result = await api.getTasks(currentFilters, { signal });
        if (seq !== loadSequence) return;
      }

      currentTasks = result.tasks ?? [];
      const total = result.meta?.total ?? currentTasks.length;
      view.setTotal(total);
      view.setTasks(currentTasks, currentCategories);

      if (currentTasks.length === 0) {
        view.setListState("empty");
      } else {
        view.setListState("ready");
      }
    } catch (error) {
      if (seq !== loadSequence) return;
      if (error instanceof ApiError && error.kind === "aborted") return;
      if (error?.name === "AbortError") return;
      view.setListState("error", messageForError(error));
    } finally {
      if (seq === loadSequence) {
        activeAbortController = null;
      }
    }
  }

  async function runMutation(action, successMessage) {
    view.setMutationPending(true);
    try {
      await action();
      if (successMessage) {
        view.notify(successMessage, "success");
      }
      await loadData(false);
    } catch (error) {
      view.notify(messageForError(error), "error");
    } finally {
      view.setMutationPending(false);
    }
  }

  function start(initialFilters = {}) {
    currentFilters = { ...initialFilters };
    return loadData(true);
  }

  function applyFilters(newFilters = {}) {
    currentFilters = { ...newFilters };
    return loadData(false);
  }

  function refresh() {
    return loadData(!categoriesLoaded);
  }

  function beginEdit(id) {
    const taskToEdit = currentTasks.find((item) => item.id === id);
    if (taskToEdit) {
      editingId = id;
      view.setFormTask(taskToEdit);
      view.showFormErrors({});
    }
  }

  function cancelEdit() {
    editingId = null;
    view.setFormTask(null);
    view.showFormErrors({});
  }

  async function submit(draft) {
    const validation = validateDraft(draft, currentCategories);
    if (!validation.valid) {
      view.showFormErrors(validation.errors);
      return;
    }
    view.showFormErrors({});

    if (editingId !== null) {
      const idToUpdate = editingId;
      await runMutation(async () => {
        await api.updateTask(idToUpdate, validation.value);
        editingId = null;
        view.setFormTask(null);
      }, "Задача успешно обновлена.");
    } else {
      await runMutation(async () => {
        await api.createTask(validation.value);
        view.setFormTask(null);
      }, "Задача успешно добавлена.");
    }
  }

  async function toggleTask(id) {
    const current = currentTasks.find((item) => item.id === id);
    const nextCompleted = current ? !current.completed : true;
    await runMutation(async () => {
      await api.setTaskCompleted(id, nextCompleted);
    }, "Статус задачи обновлён.");
  }

  async function deleteTask(id) {
    await runMutation(async () => {
      await api.deleteTask(id);
      if (editingId === id) {
        editingId = null;
        view.setFormTask(null);
      }
    }, "Задача удалена.");
  }

  async function resetData() {
    await runMutation(async () => {
      await api.resetDemoData();
      editingId = null;
      view.setFormTask(null);
    }, "Демо-данные восстановлены.");
  }

  function destroy() {
    if (activeAbortController) {
      activeAbortController.abort();
      activeAbortController = null;
    }
  }

  return {
    start,
    applyFilters,
    refresh,
    submit,
    beginEdit,
    cancelEdit,
    toggleTask,
    deleteTask,
    resetData,
    destroy,
  };
}
