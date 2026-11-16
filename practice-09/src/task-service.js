// Все фильтры объединяются через И. Исходный массив не изменяется.
export function selectTasks(tasks = [], filters = {}) {
  const { completed = null, priority = null, categoryId = null, q = '' } = filters;
  const lowerQ = typeof q === 'string' && q ? q.toLowerCase() : '';

  return tasks.filter(task => {
    if (completed !== null && task.completed !== completed) {
      return false;
    }
    if (priority !== null && task.priority !== priority) {
      return false;
    }
    if (categoryId !== null && task.categoryId !== categoryId) {
      return false;
    }
    if (lowerQ && !task.title.toLowerCase().includes(lowerQ)) {
      return false;
    }
    return true;
  });
}

// Поиск по полю id, не по индексу. Возвращает задачу или null.
export function findTask(tasks = [], id) {
  const found = tasks.find(task => task.id === id);
  return found ?? null;
}
