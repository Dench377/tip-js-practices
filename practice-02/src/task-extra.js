// Дополнительное задание: расширенные операции над задачами

// Вариант Б. Сводка задач по категориям приоритетов
export function getPrioritySummary(tasks) {
  const summary = {
    low: { total: 0, pending: 0 },
    medium: { total: 0, pending: 0 },
    high: { total: 0, pending: 0 },
  };

  for (const task of tasks) {
    if (summary[task.priority] !== undefined) {
      summary[task.priority].total += 1;
      if (!task.completed) {
        summary[task.priority].pending += 1;
      }
    }
  }

  return summary;
}

// Вариант А. Поиск задач по подстроке в названии без учета регистра
export function searchTasks(tasks, query) {
  if (typeof query !== "string") {
    return [];
  }
  const cleanQuery = query.trim().toLowerCase();
  if (cleanQuery.length === 0) {
    return [...tasks];
  }
  return tasks.filter((task) => task.title.toLowerCase().includes(cleanQuery));
}
