export const STORAGE_VERSION = 1;

// Вспомогательная функция глубокого клонирования массива задач
function cloneTasks(tasks) {
  if (!Array.isArray(tasks)) return [];
  return tasks.map((task) => ({ ...task }));
}

// Проверка валидности списка задач и схемы каждого объекта
export function isValidTaskList(value) {
  if (!Array.isArray(value)) return false;

  const seenIds = new Set();
  for (const item of value) {
    if (!item || typeof item !== "object") return false;

    // 1. Проверка id: положительное безопасное целое и уникальность
    if (typeof item.id !== "number" || !Number.isSafeInteger(item.id) || item.id <= 0) {
      return false;
    }
    if (seenIds.has(item.id)) {
      return false;
    }
    seenIds.add(item.id);

    // 2. Проверка title: непустая строка от 1 до 100 символов после trim
    if (typeof item.title !== "string") {
      return false;
    }
    const trimmedTitle = item.title.trim();
    if (trimmedTitle.length < 1 || trimmedTitle.length > 100) {
      return false;
    }

    // 3. Проверка completed: строго boolean
    if (typeof item.completed !== "boolean") {
      return false;
    }

    // 4. Проверка priority: строго low, medium или high
    if (item.priority !== "low" && item.priority !== "medium" && item.priority !== "high") {
      return false;
    }
  }

  return true;
}

// Чтение и валидация задач из хранилища
export function loadTasks(storage, key, fallbackTasks) {
  const fallbackCopy = cloneTasks(fallbackTasks);

  if (!storage || typeof storage.getItem !== "function") {
    return {
      ok: false,
      source: "fallback",
      tasks: fallbackCopy,
      error: "Объект хранилища недоступен",
    };
  }

  try {
    const raw = storage.getItem(key);
    if (raw === null) {
      return {
        ok: true,
        source: "initial",
        tasks: fallbackCopy,
      };
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return {
        ok: false,
        source: "fallback",
        tasks: fallbackCopy,
        error: "Ошибка разбора JSON в хранилище",
      };
    }

    if (!parsed || typeof parsed !== "object" || parsed.version !== STORAGE_VERSION) {
      return {
        ok: false,
        source: "fallback",
        tasks: fallbackCopy,
        error: "Некорректная версия формата данных",
      };
    }

    if (!isValidTaskList(parsed.tasks)) {
      return {
        ok: false,
        source: "fallback",
        tasks: fallbackCopy,
        error: "Некорректная структура списка задач в хранилище",
      };
    }

    return {
      ok: true,
      source: "storage",
      tasks: cloneTasks(parsed.tasks),
    };
  } catch (error) {
    return {
      ok: false,
      source: "fallback",
      tasks: fallbackCopy,
      error: `Ошибка доступа к хранилищу: ${error.message}`,
    };
  }
}

// Сериализация и сохранение списка задач
export function saveTasks(storage, key, tasks) {
  if (!isValidTaskList(tasks)) {
    return { ok: false, error: "Некорректный список задач для сохранения" };
  }

  if (!storage || typeof storage.setItem !== "function") {
    return { ok: false, error: "Объект хранилища недоступен" };
  }

  try {
    const payload = JSON.stringify({
      version: STORAGE_VERSION,
      tasks: tasks.map((t) => ({ ...t })),
    });
    storage.setItem(key, payload);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `Ошибка записи в хранилище: ${error.message}` };
  }
}

// Удаление сохраненных данных по ключу
export function removeSavedTasks(storage, key) {
  if (!storage || typeof storage.removeItem !== "function") {
    return { ok: false, error: "Объект хранилища недоступен" };
  }

  try {
    storage.removeItem(key);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: `Ошибка удаления из хранилища: ${error.message}` };
  }
}
