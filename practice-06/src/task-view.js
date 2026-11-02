const PRIORITY_LABELS = Object.freeze({
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
});

export function createTaskElement(task, category) {
  const li = document.createElement("li");
  li.className = `task-card${task.completed ? " is-completed" : ""}`;
  li.dataset.taskId = String(task.id);

  const titleEl = document.createElement("h3");
  titleEl.className = "task-title";
  titleEl.textContent = task.title;

  const metaEl = document.createElement("div");
  metaEl.className = "task-meta";

  const statusEl = document.createElement("span");
  statusEl.className = "task-status";
  statusEl.textContent = task.completed ? "Выполнена" : "В работе";

  const priorityEl = document.createElement("span");
  priorityEl.className = "task-priority";
  priorityEl.textContent = `Приоритет: ${PRIORITY_LABELS[task.priority] ?? task.priority}`;

  const categoryEl = document.createElement("span");
  categoryEl.className = "task-category";
  categoryEl.textContent = category?.name ?? "Без категории";

  metaEl.append(statusEl, priorityEl, categoryEl);

  const actionsEl = document.createElement("div");
  actionsEl.className = "task-actions";

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.dataset.action = "toggle";
  const toggleLabel = document.createElement("span");
  toggleLabel.className = "action-label";
  toggleLabel.textContent = task.completed ? "Вернуть в работу" : "Завершить";
  toggleBtn.append(toggleLabel);

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.dataset.action = "edit";
  const editLabel = document.createElement("span");
  editLabel.className = "action-label";
  editLabel.textContent = "Изменить";
  editBtn.append(editLabel);

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.dataset.action = "delete";
  const deleteLabel = document.createElement("span");
  deleteLabel.className = "action-label";
  deleteLabel.textContent = "Удалить";
  deleteBtn.append(deleteLabel);

  actionsEl.append(toggleBtn, editBtn, deleteBtn);

  li.append(titleEl, metaEl, actionsEl);
  return li;
}

export function renderTaskList(list, tasks = [], categories = []) {
  const categoryMap = new Map((categories || []).map((cat) => [cat.id, cat]));
  const items = (tasks || []).map((task) => createTaskElement(task, categoryMap.get(task.categoryId)));
  list.replaceChildren(...items);
}
