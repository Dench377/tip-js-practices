// Отбор задач по фильтру (чистая функция без мутаций входного массива)
export function getVisibleTasks(tasks, filter = "all") {
  if (filter === "pending") return tasks.filter((t) => !t.completed);
  if (filter === "completed") return tasks.filter((t) => t.completed);
  return [...tasks];
}
