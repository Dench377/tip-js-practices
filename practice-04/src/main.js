import { demoTasks, variantTasks, variantNumber } from "./data.js";
import {
  addTask,
  findTaskById,
  removeTask,
  setTaskCompleted,
  updateTask,
} from "./task-service.js";
import { getVisibleTasks } from "./task-selectors.js";
import { renderEmptyState, renderSummary, renderTaskList } from "./task-view.js";
import { validateTaskDraft } from "./form-validation.js";
import { loadTasks, removeSavedTasks, saveTasks } from "./task-storage.js";

const elements = {
  list: document.querySelector("#task-list"),
  filters: document.querySelector("#task-filters"),
  summary: document.querySelector("#task-summary"),
  empty: document.querySelector("#empty-message"),
  message: document.querySelector("#operation-message"),
  datasetLabel: document.querySelector("#dataset-label"),
  storageStatus: document.querySelector("#storage-status"),
  form: document.querySelector("#task-form"),
  formHeading: document.querySelector("#form-heading"),
  formMode: document.querySelector("#form-mode"),
  formMessage: document.querySelector("#form-message"),
  idInput: document.querySelector("#task-id"),
  titleInput: document.querySelector("#task-title"),
  priorityInput: document.querySelector("#task-priority"),
  submitButton: document.querySelector("#form-submit"),
  cancelButton: document.querySelector("#cancel-edit"),
  resetButton: document.querySelector("#reset-data"),
};

const params = new URLSearchParams(window.location.search);
const isVariant = params.get("dataset") === "variant";
const isCheckRun = params.get("mode") === "check";
const initialTasks = isVariant ? variantTasks : demoTasks;
const datasetName = isVariant ? "variant" : "demo";
const storageKey = isCheckRun
  ? `tip-js-practice-04:checks:${datasetName}`
  : `tip-js-practice-04:${datasetName}`;

// Начальная загрузка данных из хранилища либо fallback
let loaded;
try {
  loaded = loadTasks(window.localStorage, storageKey, initialTasks);
} catch (error) {
  loaded = {
    ok: false,
    source: "fallback",
    tasks: initialTasks.map((task) => ({ ...task })),
    error: `Хранилище не инициализировано: ${error.message}`,
  };
  console.error(error);
}
let currentTasks = loaded.tasks;
let currentFilter = "all";
let editingId = null;

if (elements.datasetLabel) {
  elements.datasetLabel.textContent = isVariant
    ? `Индивидуальный вариант: ${variantNumber ?? "не указан"}`
    : "Общий контрольный набор";
}

if (elements.storageStatus) {
  if (loaded.source === "storage") {
    elements.storageStatus.textContent = "Данные восстановлены из localStorage.";
  } else if (loaded.ok) {
    elements.storageStatus.textContent = "Используется исходный набор; сохранённых данных пока нет.";
  } else {
    elements.storageStatus.textContent = loaded.error;
    elements.storageStatus.classList.add("is-warning");
  }
}

// Согласованная отрисовка приложения (чистый DOM без побочных эффектов записи)
function renderApp() {
  const visibleTasks = getVisibleTasks(currentTasks, currentFilter);
  renderTaskList(elements.list, visibleTasks);
  renderSummary(elements.summary, currentTasks, visibleTasks.length);
  renderEmptyState(elements.empty, currentTasks.length, visibleTasks.length);

  // Обновление состояния кнопок фильтра
  const filterButtons = elements.filters.querySelectorAll("[data-filter]");
  for (const button of filterButtons) {
    const isActive = button.dataset.filter === currentFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  }
}

function clearFieldError(name) {
  const input = elements.form.elements.namedItem(name);
  const message = elements.form.querySelector(`[data-error-for="${name}"]`);
  if (input instanceof HTMLInputElement || input instanceof HTMLSelectElement) {
    input.setCustomValidity("");
    input.removeAttribute("aria-invalid");
  }
  if (message) message.textContent = "";
}

function clearFormErrors() {
  for (const name of ["id", "title", "priority"]) clearFieldError(name);
  elements.formMessage.textContent = "";
}

function showFormErrors(errors) {
  clearFormErrors();
  for (const [name, text] of Object.entries(errors)) {
    const input = elements.form.elements.namedItem(name);
    const message = elements.form.querySelector(`[data-error-for="${name}"]`);
    if (input instanceof HTMLInputElement || input instanceof HTMLSelectElement) {
      input.setCustomValidity(text);
      input.setAttribute("aria-invalid", "true");
    }
    if (message) message.textContent = text;
  }
  elements.form.reportValidity();
}

// Управление режимами формы (создание / редактирование)
function setFormMode(id = null) {
  clearFormErrors();

  if (id === null || id === undefined) {
    editingId = null;
    elements.idInput.value = "";
    elements.idInput.disabled = false;
    elements.titleInput.value = "";
    elements.priorityInput.value = "medium";
    elements.formHeading.textContent = "Добавление задачи";
    elements.submitButton.textContent = "Добавить задачу";
    elements.cancelButton.hidden = true;
    if (elements.formMode) elements.formMode.textContent = "Режим создания";
    elements.idInput.focus();
    return;
  }

  const task = findTaskById(currentTasks, Number(id));
  if (!task) {
    elements.message.textContent = "Задача для редактирования не найдена";
    return;
  }

  editingId = task.id;
  elements.idInput.value = String(task.id);
  elements.idInput.disabled = true;
  elements.titleInput.value = task.title;
  elements.priorityInput.value = task.priority;
  elements.formHeading.textContent = "Редактирование задачи";
  elements.submitButton.textContent = "Сохранить изменения";
  elements.cancelButton.hidden = false;
  if (elements.formMode) elements.formMode.textContent = `Редактирование задачи #${task.id}`;
  elements.titleInput.focus();
}

// Сохранение актуального списка задач в localStorage
function persistCurrentTasks(successMessage) {
  const saved = saveTasks(window.localStorage, storageKey, currentTasks);
  elements.storageStatus.classList.toggle("is-warning", !saved.ok);
  elements.storageStatus.textContent = saved.ok
    ? "Изменения сохранены в localStorage."
    : saved.error;
  elements.message.textContent = saved.ok ? successMessage : `${successMessage} ${saved.error}`;
  renderApp();
  return saved;
}

// Вспомогательное восстановление фокуса после перерисовки карточек
function restoreTaskFocus(id, action) {
  const actionButton = elements.list.querySelector(
    `[data-task-id="${id}"] button[data-action="${action}"]`,
  );
  const filterButton = elements.filters.querySelector(`[data-filter="${currentFilter}"]`);
  (actionButton ?? filterButton)?.focus();
}

// Обработка отправки формы
function handleFormSubmit(event) {
  event.preventDefault();

  const formData = new FormData(elements.form);
  const draft = {
    id: editingId !== null ? editingId : formData.get("id"),
    title: formData.get("title"),
    priority: formData.get("priority"),
  };

  const validation = validateTaskDraft(draft, currentTasks, editingId);
  if (!validation.ok) {
    showFormErrors(validation.errors);
    return;
  }

  clearFormErrors();

  if (editingId === null) {
    const result = addTask(
      currentTasks,
      validation.value.id,
      validation.value.title,
      validation.value.priority,
    );
    if (!result.ok) {
      showFormErrors({ id: result.error });
      return;
    }
    currentTasks = result.tasks;
    setFormMode(null);
    persistCurrentTasks(`Задача #${validation.value.id} успешно добавлена.`);
  } else {
    const result = updateTask(
      currentTasks,
      validation.value.id,
      validation.value.title,
      validation.value.priority,
    );
    if (!result.ok) {
      showFormErrors({ title: result.error });
      return;
    }
    currentTasks = result.tasks;
    setFormMode(null);
    persistCurrentTasks(`Задача #${validation.value.id} успешно обновлена.`);
  }
}

// Делегированная обработка кликов по карточкам задач
function handleTaskListClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button) return;

  const card = button.closest("[data-task-id]");
  if (!card) return;

  const id = Number(card.dataset.taskId);
  if (!Number.isSafeInteger(id) || id <= 0) return;

  const action = button.dataset.action;

  if (action === "edit") {
    setFormMode(id);
    return;
  }

  if (action === "toggle") {
    const task = findTaskById(currentTasks, id);
    if (!task) return;
    const result = setTaskCompleted(currentTasks, id, !task.completed);
    if (result.ok) {
      currentTasks = result.tasks;
      persistCurrentTasks(`Статус задачи #${id} изменён.`);
      restoreTaskFocus(id, "toggle");
    }
    return;
  }

  if (action === "delete") {
    const result = removeTask(currentTasks, id);
    if (result.ok) {
      currentTasks = result.tasks;
      if (editingId === id) {
        setFormMode(null);
      }
      persistCurrentTasks(`Задача #${id} удалена.`);
      restoreTaskFocus(id, "delete");
    }
  }
}

// Обработка переключения фильтров
function handleFilterClick(event) {
  const button = event.target.closest("button[data-filter]");
  if (!button) return;
  currentFilter = button.dataset.filter;
  renderApp();
}

// Сброс сохранённых данных к начальному набору
function handleResetClick() {
  const removeResult = removeSavedTasks(window.localStorage, storageKey);
  currentTasks = initialTasks.map((t) => ({ ...t }));
  currentFilter = "all";
  setFormMode(null);

  elements.storageStatus.classList.remove("is-warning");
  if (removeResult.ok) {
    elements.storageStatus.textContent = "Используется исходный набор; сохранённых данных пока нет.";
    elements.message.textContent = "Данные сброшены к исходному набору.";
  } else {
    elements.storageStatus.textContent = removeResult.error;
    elements.storageStatus.classList.add("is-warning");
  }
  renderApp();
}

// Дополнительное задание (Вариант Б): межвкладочная синхронизация через событие storage
window.addEventListener("storage", (event) => {
  if (event.key === storageKey) {
    const reloaded = loadTasks(window.localStorage, storageKey, initialTasks);
    currentTasks = reloaded.tasks;
    if (editingId !== null && !findTaskById(currentTasks, editingId)) {
      setFormMode(null);
    }
    renderApp();
  }
});

// Регистрация обработчиков событий
elements.form.addEventListener("submit", handleFormSubmit);
elements.form.addEventListener("input", (event) => {
  if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement) {
    clearFieldError(event.target.name);
  }
});
elements.list.addEventListener("click", handleTaskListClick);
elements.filters.addEventListener("click", handleFilterClick);
elements.cancelButton.addEventListener("click", () => setFormMode());
elements.resetButton.addEventListener("click", handleResetClick);

// Начальный запуск
try {
  setFormMode();
  renderApp();
} catch (error) {
  elements.message.textContent = `Ошибка запуска: ${error.message}`;
  console.error(error);
}
