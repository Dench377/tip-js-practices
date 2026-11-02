import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

function isTask(value) {
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

function isCategory(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.name === "string"
    && value.name.trim().length >= 1
    && value.name.trim().length <= 100,
  );
}

// Фабрика предметного API задач и категорий
export function createTaskApi(client) {
  if (!client || typeof client.requestJson !== "function") {
    throw new TypeError("Ожидается объект client с методом requestJson");
  }

  // 1. Получение коллекции задач с фильтрацией
  async function getTasks(filters = {}) {
    if (filters === null || typeof filters !== "object" || Array.isArray(filters)) {
      throw new TypeError("Параметры фильтрации должны быть объектом");
    }

    const normalizedQuery = {};
    for (const [key, value] of Object.entries(filters)) {
      if (!ALLOWED_FILTERS.has(key)) {
        throw new TypeError(`Неизвестный параметр фильтрации: ${key}`);
      }

      if (key === "completed") {
        if (typeof value !== "boolean") {
          throw new TypeError("Фильтр completed должен быть логическим значением (boolean)");
        }
        normalizedQuery.completed = value;
      } else if (key === "priority") {
        if (typeof value !== "string" || !ALLOWED_PRIORITIES.has(value)) {
          throw new TypeError("Недопустимое значение фильтра priority");
        }
        normalizedQuery.priority = value;
      } else if (key === "categoryId") {
        if (!isPositiveSafeInteger(value)) {
          throw new TypeError("Фильтр categoryId должен быть положительным целым числом");
        }
        normalizedQuery.categoryId = value;
      } else if (key === "q") {
        if (typeof value !== "string") {
          throw new TypeError("Фильтр q должен быть строкой");
        }
        const trimmed = value.trim();
        if (trimmed.length > 100) {
          throw new TypeError("Длина строки поиска q не должна превышать 100 символов");
        }
        normalizedQuery.q = trimmed;
      }
    }

    const requestOptions = Object.keys(normalizedQuery).length > 0
      ? { query: normalizedQuery }
      : undefined;

    const payload = await client.requestJson("/tasks", requestOptions);

    if (!payload || typeof payload !== "object" || !Array.isArray(payload.data) || !payload.meta) {
      throw invalidResponse("Некорректная структура ответа коллекции задач");
    }

    if (payload.meta.total !== payload.data.length) {
      throw invalidResponse("meta.total не соответствует фактической длине массива data");
    }

    const seenIds = new Set();
    for (const item of payload.data) {
      if (!isTask(item)) {
        throw invalidResponse("Объект задачи в коллекции не соответствует схеме модели");
      }
      if (seenIds.has(item.id)) {
        throw invalidResponse(`Обнаружен дубликат идентификатора задачи id=${item.id}`);
      }
      seenIds.add(item.id);
    }

    return {
      tasks: payload.data,
      meta: payload.meta,
    };
  }

  // 2. Получение одной задачи по числовому id
  async function getTaskById(id) {
    if (!isPositiveSafeInteger(id)) {
      throw new TypeError("Идентификатор задачи должен быть положительным целым числом");
    }

    const payload = await client.requestJson(`/tasks/${id}`);

    if (!payload || typeof payload !== "object" || !isTask(payload.data)) {
      throw invalidResponse("Некорректная структура задачи в ответе");
    }

    return payload.data;
  }

  // 3. Получение списка категорий
  async function getCategories() {
    const payload = await client.requestJson("/categories");

    if (!payload || typeof payload !== "object" || !Array.isArray(payload.data) || !payload.meta) {
      throw invalidResponse("Некорректная структура ответа категорий");
    }

    if (payload.meta.total !== payload.data.length) {
      throw invalidResponse("meta.total категорий не соответствует длине массива");
    }

    const seenIds = new Set();
    for (const item of payload.data) {
      if (!isCategory(item)) {
        throw invalidResponse("Объект категории не соответствует схеме модели");
      }
      if (seenIds.has(item.id)) {
        throw invalidResponse(`Обнаружен дубликат категории id=${item.id}`);
      }
      seenIds.add(item.id);
    }

    return payload.data;
  }

  // 4. Параллельная начальная загрузка задач и категорий
  async function loadInitialData(filters = {}) {
    const tasksPromise = getTasks(filters);
    const categoriesPromise = getCategories();

    const [tasksResult, categories] = await Promise.all([tasksPromise, categoriesPromise]);

    return {
      tasks: tasksResult.tasks,
      categories,
      meta: tasksResult.meta,
    };
  }

  // 5. Дополнительное задание (Вариант А): устойчивая загрузка через Promise.allSettled
  async function loadInitialDataSettled(filters = {}) {
    const tasksPromise = getTasks(filters);
    const categoriesPromise = getCategories();

    const [tasksSettled, categoriesSettled] = await Promise.allSettled([
      tasksPromise,
      categoriesPromise,
    ]);

    return {
      tasks: tasksSettled.status === "fulfilled" ? tasksSettled.value.tasks : null,
      meta: tasksSettled.status === "fulfilled" ? tasksSettled.value.meta : null,
      categories: categoriesSettled.status === "fulfilled" ? categoriesSettled.value : null,
      errors: {
        tasks: tasksSettled.status === "rejected" ? tasksSettled.reason : null,
        categories: categoriesSettled.status === "rejected" ? categoriesSettled.reason : null,
      },
    };
  }

  return {
    getTasks,
    getTaskById,
    getCategories,
    loadInitialData,
    loadInitialDataSettled,
  };
}
