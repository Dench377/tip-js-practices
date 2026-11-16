import { ApiError } from './errors.js';
import { jsonBody } from './json-body.js';
import { requireTask } from './task-resource.js';
import { validateTaskInput } from './task-validation.js';

export function registerWriteRoutes(router, store) {
  router.post('/tasks', ...jsonBody, (req, res) => {
    const categoryIds = new Set(store.listCategories().map(item => item.id));
    const validated = validateTaskInput(req.body, { partial: false, categoryIds });
    const task = store.createTask(validated);
    res.status(201)
      .set('Location', `/api/tasks/${task.id}`)
      .json({ data: task });
  });

  router.patch('/tasks/:id', requireTask(store), ...jsonBody, (req, res) => {
    const categoryIds = new Set(store.listCategories().map(item => item.id));
    const changes = validateTaskInput(req.body, { partial: true, categoryIds });
    const updated = store.updateTask(req.task.id, changes);
    if (!updated) {
      throw new ApiError(404, 'TASK_NOT_FOUND', `Задача с id ${req.task.id} не найдена.`, { id: req.task.id });
    }
    res.status(200).json({ data: updated });
  });

  router.delete('/tasks/:id', requireTask(store), (req, res) => {
    const deleted = store.deleteTask(req.task.id);
    if (!deleted) {
      throw new ApiError(404, 'TASK_NOT_FOUND', `Задача с id ${req.task.id} не найдена.`, { id: req.task.id });
    }
    res.status(204).end();
  });
}
