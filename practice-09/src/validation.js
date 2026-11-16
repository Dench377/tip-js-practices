import { ApiError } from './errors.js';

const ALLOWED_KEYS = new Set(['q', 'completed', 'priority', 'categoryId']);
const ALLOWED_PRIORITIES = new Set(['low', 'medium', 'high']);

// raw: строка; результат: безопасное положительное целое либо null.
export function parsePositiveId(raw) {
  if (typeof raw !== 'string') return null;
  if (!/^[1-9]\d*$/.test(raw)) return null;
  const num = Number(raw);
  if (!Number.isSafeInteger(num) || num <= 0) return null;
  return num;
}

// URLSearchParams -> { completed: boolean|null, priority: string|null, categoryId: number|null, q: string }
// Ошибка: ApiError(400, 'INVALID_QUERY', ...)
export function parseFilters(searchParams) {
  const seen = new Set();
  for (const key of searchParams.keys()) {
    if (seen.has(key)) {
      throw new ApiError(400, 'INVALID_QUERY', `Параметр ${key} нельзя указывать повторно.`);
    }
    seen.add(key);
  }

  for (const key of seen) {
    if (!ALLOWED_KEYS.has(key)) {
      throw new ApiError(400, 'INVALID_QUERY', `Неизвестный параметр запроса: ${key}.`);
    }
  }

  // 1. completed
  let completed = null;
  if (searchParams.has('completed')) {
    const rawCompleted = searchParams.get('completed');
    if (rawCompleted === 'true') {
      completed = true;
    } else if (rawCompleted === 'false') {
      completed = false;
    } else {
      throw new ApiError(400, 'INVALID_QUERY', 'Параметр completed должен иметь значение "true" или "false".');
    }
  }

  // 2. priority
  let priority = null;
  if (searchParams.has('priority')) {
    const rawPriority = searchParams.get('priority');
    if (!ALLOWED_PRIORITIES.has(rawPriority)) {
      throw new ApiError(400, 'INVALID_QUERY', 'Параметр priority должен быть "low", "medium" или "high".');
    }
    priority = rawPriority;
  }

  // 3. categoryId
  let categoryId = null;
  if (searchParams.has('categoryId')) {
    const rawCategoryId = searchParams.get('categoryId');
    const parsed = parsePositiveId(rawCategoryId);
    if (parsed === null) {
      throw new ApiError(400, 'INVALID_QUERY', 'Параметр categoryId должен быть положительным целым числом.');
    }
    categoryId = parsed;
  }

  // 4. q
  let q = '';
  if (searchParams.has('q')) {
    const rawQ = searchParams.get('q');
    const trimmed = rawQ.trim();
    if (trimmed.length > 100) {
      throw new ApiError(400, 'INVALID_QUERY', 'Параметр q не должен превышать 100 символов.');
    }
    q = trimmed;
  }

  return { completed, priority, categoryId, q };
}
