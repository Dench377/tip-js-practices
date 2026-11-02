import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

export function isTask(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.title === "string"
    && value.title.trim().length >= 1
    && value.title.trim().length <= 100
    && typeof value.completed === "boolean"
    && ALLOWED_PRIORITIES.has(value.priority)
    && isPositiveSafeInteger(value.categoryId),
  );
}

export function isCategory(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.name === "string"
    && value.name.trim().length >= 1
    && value.name.trim().length <= 100,
  );
}

function validateAndNormalizeFilters(filters = {}) {
  if (typeof filters !== "object" || filters === null) {
    throw new TypeError("Фильтры должны быть объектом.");
  }
  const query = {};
  for (const [key, value] of Object.entries(filters)) {
    if (!ALLOWED_FILTERS.has(key)) {
      throw new TypeError(`Недопустимый параметр фильтра: ${key}`);
    }
    if (value === undefined || value === null) {
      continue;
    }
    if (key === "completed") {
      if (typeof value !== "boolean") {
        throw new TypeError("Параметр completed должен быть boolean.");
      }
      query.completed = value;
    } else if (key === "priority") {
      if (typeof value !== "string" || !ALLOWED_PRIORITIES.has(value)) {
        throw new TypeError("Недопустимое значение приоритета.");
      }
      query.priority = value;
    } else if (key === "categoryId") {
      if (!isPositiveSafeInteger(value)) {
        throw new TypeError("Параметр categoryId должен быть положительным целым числом.");
      }
      query.categoryId = value;
    } else if (key === "q") {
      if (typeof value !== "string") {
        throw new TypeError("Параметр q должен быть строкой.");
      }
      const trimmed = value.trim();
      if (trimmed.length < 1 || trimmed.length > 100) {
        throw new TypeError("Параметр q должен содержать от 1 до 100 символов.");
      }
      query.q = trimmed;
    }
  }
  return query;
}

// Методы результата:
// getTasks, getTaskById, getCategories, loadInitialData, createTask, updateTask,
// setTaskCompleted, deleteTask и resetDemoData.
export function createTaskApi(client) {
  if (!client || typeof client.requestJson !== "function") {
    throw new TypeError("Объект client должен содержать метод requestJson.");
  }

  async function getTasks(filters = {}, { signal } = {}) {
    const query = validateAndNormalizeFilters(filters);
    const response = await client.requestJson("/tasks", { query, signal });
    if (!response || !Array.isArray(response.data) || !response.data.every(isTask)) {
      throw invalidResponse("Сервер вернул некорректный список задач.");
    }
    return {
      tasks: response.data,
      meta: response.meta ?? { total: response.data.length, filters: query },
    };
  }

  async function getTaskById(id, { signal } = {}) {
    if (!isPositiveSafeInteger(id)) {
      throw new TypeError("id задачи должен быть положительным целым числом.");
    }
    const response = await client.requestJson(`/tasks/${id}`, { signal });
    if (!response || !isTask(response.data)) {
      throw invalidResponse("Сервер вернул некорректную структуру задачи.");
    }
    return response.data;
  }

  async function getCategories({ signal } = {}) {
    const response = await client.requestJson("/categories", { signal });
    if (!response || !Array.isArray(response.data) || !response.data.every(isCategory)) {
      throw invalidResponse("Сервер вернул некорректный список категорий.");
    }
    return response.data;
  }

  async function loadInitialData(filters = {}, { signal } = {}) {
    const [taskResult, categories] = await Promise.all([
      getTasks(filters, { signal }),
      getCategories({ signal }),
    ]);
    return {
      tasks: taskResult.tasks,
      categories,
      meta: taskResult.meta,
    };
  }

  async function createTask(draft, { signal } = {}) {
    const response = await client.requestJson("/tasks", {
      method: "POST",
      body: draft,
      signal,
    });
    if (!response || !isTask(response.data)) {
      throw invalidResponse("Сервер вернул некорректные данные созданной задачи.");
    }
    return response.data;
  }

  async function updateTask(id, changes, { signal } = {}) {
    if (!isPositiveSafeInteger(id)) {
      throw new TypeError("id задачи должен быть положительным целым числом.");
    }
    const response = await client.requestJson(`/tasks/${id}`, {
      method: "PATCH",
      body: changes,
      signal,
    });
    if (!response || !isTask(response.data)) {
      throw invalidResponse("Сервер вернул некорректные данные обновлённой задачи.");
    }
    return response.data;
  }

  async function setTaskCompleted(id, completed, { signal } = {}) {
    if (!isPositiveSafeInteger(id)) {
      throw new TypeError("id задачи должен быть положительным целым числом.");
    }
    if (typeof completed !== "boolean") {
      throw new TypeError("completed должен быть логическим значением.");
    }
    const response = await client.requestJson(`/tasks/${id}`, {
      method: "PATCH",
      body: { completed },
      signal,
    });
    if (!response || !isTask(response.data)) {
      throw invalidResponse("Сервер вернул некорректные данные обновлённой задачи.");
    }
    return response.data;
  }

  async function deleteTask(id, { signal } = {}) {
    if (!isPositiveSafeInteger(id)) {
      throw new TypeError("id задачи должен быть положительным целым числом.");
    }
    const response = await client.requestJson(`/tasks/${id}`, {
      method: "DELETE",
      signal,
    });
    if (response !== null) {
      throw invalidResponse("Ожидался пустой ответ 204 при удалении задачи.");
    }
    return null;
  }

  async function resetDemoData({ signal } = {}) {
    const response = await client.requestJson("/debug/reset", {
      method: "POST",
      signal,
    });
    if (!response || typeof response.data !== "object" || response.data?.reset !== true) {
      throw invalidResponse("Некорректный ответ сброса данных.");
    }
    return response.data;
  }

  return {
    getTasks,
    getTaskById,
    getCategories,
    loadInitialData,
    createTask,
    updateTask,
    setTaskCompleted,
    deleteTask,
    resetDemoData,
  };
}
