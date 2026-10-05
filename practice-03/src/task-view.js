import { getTaskStats } from "./task-service.js";

// Создание элемента карточки задачи средствами DOM без innerHTML
export function createTaskElement(task) {
  const card = document.createElement("li");
  card.className = "task-card";
  if (task.completed) card.classList.add("is-completed");
  card.dataset.taskId = String(task.id);

  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;

  const status = document.createElement("span");
  status.className = "task-status";
  status.textContent = task.completed ? "Выполнена" : "В работе";

  const priorityLabels = { low: "Низкий", medium: "Средний", high: "Высокий" };
  const priority = document.createElement("span");
  priority.className = "task-priority";
  priority.textContent = priorityLabels[task.priority] ?? task.priority;

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.dataset.action = "toggle";
  toggleBtn.setAttribute("aria-pressed", String(Boolean(task.completed)));
  const toggleLabel = document.createElement("span");
  toggleLabel.className = "action-label";
  toggleLabel.textContent = "Выполнена";
  toggleBtn.append(toggleLabel);

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.dataset.action = "delete";
  const deleteLabel = document.createElement("span");
  deleteLabel.className = "action-label";
  deleteLabel.textContent = "Удалить";
  deleteBtn.append(deleteLabel);

  actions.append(toggleBtn, deleteBtn);
  card.append(title, status, priority, actions);
  return card;
}

// Замена дочерних элементов списка задач без пересоздания ul
export function renderTaskList(listElement, tasks) {
  const cards = tasks.map(createTaskElement);
  listElement.replaceChildren(...cards);
}

// Обновление пяти показателей сводки по всему списку
export function renderSummary(summaryElement, tasks, visibleCount) {
  const stats = getTaskStats(tasks);
  const fields = {
    total: String(stats.total),
    completed: String(stats.completed),
    pending: String(stats.pending),
    progress: `${stats.progress.toFixed(1)}%`,
    visible: String(visibleCount),
  };
  for (const [key, value] of Object.entries(fields)) {
    const node = summaryElement.querySelector(`[data-stat="${key}"]`);
    if (node) node.textContent = value;
  }
}

// Отображение и скрытие сообщений о пустом списке
export function renderEmptyState(messageElement, total, visibleCount) {
  if (total === 0 && visibleCount === 0) {
    messageElement.textContent = "Список задач пуст.";
    messageElement.hidden = false;
  } else if (total > 0 && visibleCount === 0) {
    messageElement.textContent = "Нет задач по выбранному фильтру.";
    messageElement.hidden = false;
  } else {
    messageElement.textContent = "";
    messageElement.hidden = true;
  }
}
