import { Router } from 'express';
import { ApiError } from './errors.js';
import { parsePositiveId, parseFilters } from './validation.js';

export function createRouter(store) {
  const router = Router({ caseSensitive: true });

  // 1. Health check
  router.get('/health', (req, res) => {
    res.json({ data: { status: 'ok' } });
  });

  // 2. Список категорий
  router.get('/categories', (req, res) => {
    const categories = store.listCategories();
    res.json({ data: categories, meta: { total: categories.length } });
  });

  // 3. Список задач с фильтрацией
  router.get('/tasks', (req, res) => {
    const url = new URL(req.originalUrl, 'http://localhost');
    const filters = parseFilters(url.searchParams);
    const tasks = store.listTasks(filters);
    res.json({ data: tasks, meta: { total: tasks.length, filters } });
  });

  // 4. Отдельная задача по ID
  router.get('/tasks/:id', (req, res) => {
    const id = parsePositiveId(req.params.id);
    if (id === null) {
      throw new ApiError(400, 'INVALID_ID', 'Идентификатор задачи должен быть положительным целым числом.');
    }
    const task = store.getTask(id);
    if (!task) {
      throw new ApiError(404, 'TASK_NOT_FOUND', `Задача с id ${id} не найдена.`, { id });
    }
    res.json({ data: task });
  });

  // 5. Обработка неподдерживаемых методов (405 METHOD_NOT_ALLOWED)
  const knownPaths = ['/health', '/categories', '/tasks', '/tasks/:id'];
  for (const path of knownPaths) {
    router.all(path, (req, res, next) => {
      res.set('Allow', 'GET, HEAD, OPTIONS');
      next(new ApiError(405, 'METHOD_NOT_ALLOWED', `Метод ${req.method} не поддерживается для ${path}.`));
    });
  }

  return router;
}
