import { ApiError } from './errors.js';

const ALLOWED_POST_KEYS = new Set(['title', 'priority', 'categoryId']);
const ALLOWED_PATCH_KEYS = new Set(['title', 'priority', 'categoryId', 'completed']);
const ALLOWED_PRIORITIES = new Set(['low', 'medium', 'high']);

// categoryIds — Set существующих id категорий.
// Возвращает НОВЫЙ объект только с нормализованными разрешёнными полями.
// partial=false: title, priority, categoryId обязательны; completed/id запрещены.
// partial=true: хотя бы одно из title, priority, categoryId, completed; id запрещён.
// Ошибка: ApiError(400, 'VALIDATION_ERROR', сообщение, details).
export function validateTaskInput(value, { partial = false, categoryIds } = {}) {
  const details = Object.create(null);

  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    details.body = 'Тело запроса должно быть JSON-объектом.';
    throw new ApiError(400, 'VALIDATION_ERROR', 'Данные задачи не прошли проверку.', details);
  }

  const allowedKeys = partial ? ALLOWED_PATCH_KEYS : ALLOWED_POST_KEYS;

  // Проверяем все собственные свойства (включая __proto__)
  const ownKeys = Object.keys(value);
  if (Object.prototype.hasOwnProperty.call(value, '__proto__') && !ownKeys.includes('__proto__')) {
    ownKeys.push('__proto__');
  }

  for (const key of ownKeys) {
    if (!allowedKeys.has(key)) {
      details[key] = `Поле ${key} не разрешено.`;
    }
  }

  if (partial && ownKeys.filter(k => allowedKeys.has(k)).length === 0) {
    details.body = 'Тело PATCH-запроса не содержит полей для изменения.';
  }

  const result = {};

  // 1. title
  if (!partial && !('title' in value)) {
    details.title = 'Поле title обязательно для заполнения.';
  } else if ('title' in value) {
    if (typeof value.title !== 'string') {
      details.title = 'Название должно быть строкой.';
    } else {
      const trimmed = value.title.trim();
      if (trimmed.length < 1 || trimmed.length > 100) {
        details.title = 'Название должно содержать от 1 до 100 символов.';
      } else {
        result.title = trimmed;
      }
    }
  }

  // 2. priority
  if (!partial && !('priority' in value)) {
    details.priority = 'Поле priority обязательно для заполнения.';
  } else if ('priority' in value) {
    if (typeof value.priority !== 'string' || !ALLOWED_PRIORITIES.has(value.priority)) {
      details.priority = 'Приоритет должен быть "low", "medium" или "high".';
    } else {
      result.priority = value.priority;
    }
  }

  // 3. categoryId
  if (!partial && !('categoryId' in value)) {
    details.categoryId = 'Поле categoryId обязательно для заполнения.';
  } else if ('categoryId' in value) {
    const rawCat = value.categoryId;
    if (
      typeof rawCat !== 'number' ||
      !Number.isSafeInteger(rawCat) ||
      rawCat <= 0 ||
      (categoryIds && !categoryIds.has(rawCat))
    ) {
      details.categoryId = 'Категория должна быть существующим числовым идентификатором.';
    } else {
      result.categoryId = rawCat;
    }
  }

  // 4. completed (только для partial = true)
  if (partial && 'completed' in value) {
    if (typeof value.completed !== 'boolean') {
      details.completed = 'Поле completed должно быть логическим значением (true или false).';
    } else {
      result.completed = value.completed;
    }
  }

  if (Object.keys(details).length > 0) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'Данные задачи не прошли проверку.', details);
  }

  return result;
}
