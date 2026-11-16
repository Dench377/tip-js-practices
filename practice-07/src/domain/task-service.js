const ALLOWED_PRIORITIES = new Set(['low', 'medium', 'high']);

// Возвращает { valid, value: { title, priority, categoryId }, errors }.
export function validateTaskDraft(draft, categories = []) {
  const errors = {};

  const rawTitle = typeof draft?.title === 'string' ? draft.title : '';
  const trimmedTitle = rawTitle.trim();
  if (typeof draft?.title !== 'string' || trimmedTitle.length < 1 || trimmedTitle.length > 100) {
    errors.title = 'Название должно содержать от 1 до 100 символов.';
  }

  const rawPriority = draft?.priority;
  if (typeof rawPriority !== 'string' || !ALLOWED_PRIORITIES.has(rawPriority)) {
    errors.priority = 'Выберите корректный приоритет из списка.';
  }

  const rawCat = draft?.categoryId;
  const numCategoryId = Number(rawCat);
  const categoryExists =
    rawCat !== '' &&
    rawCat !== null &&
    rawCat !== undefined &&
    typeof rawCat !== 'boolean' &&
    Number.isSafeInteger(numCategoryId) &&
    numCategoryId > 0 &&
    (categories || []).some(category => category.id === numCategoryId);

  if (!categoryExists) {
    errors.categoryId = 'Выберите существующую категорию.';
  }

  const valid = Object.keys(errors).length === 0;

  return {
    valid,
    value: {
      title: trimmedTitle,
      priority: rawPriority,
      categoryId: categoryExists ? numCategoryId : null,
    },
    errors,
  };
}

// Совместная фильтрация по q, completed, priority, categoryId.
export function selectTasks(tasks = [], filters = {}) {
  const q = typeof filters.q === 'string' ? filters.q.trim().toLowerCase() : '';
  const completed = filters.completed;
  const priority = filters.priority;
  const categoryId = filters.categoryId;

  return tasks.filter(task => {
    if (q && !task.title.toLowerCase().includes(q)) {
      return false;
    }
    if (completed === 'true' && !task.completed) {
      return false;
    }
    if (completed === 'false' && task.completed) {
      return false;
    }
    if (priority && task.priority !== priority) {
      return false;
    }
    if (categoryId && String(task.categoryId) !== String(categoryId)) {
      return false;
    }
    return true;
  });
}

// Статистика { total, completed, active } по всему массиву.
export function getTaskStats(tasks = []) {
  const total = tasks.length;
  let completed = 0;
  for (const task of tasks) {
    if (task.completed) completed++;
  }
  return {
    total,
    completed,
    active: total - completed,
  };
}

// Добавление новой задачи в конец с completed: false и проверкой id.
export function addTask(tasks, value, id) {
  if (typeof id !== 'number' || !Number.isSafeInteger(id) || id <= 0) {
    throw new TypeError('Идентификатор задачи должен быть положительным целым числом.');
  }
  if (tasks.some(task => task.id === id)) {
    throw new Error(`Задача с id ${id} уже существует.`);
  }
  return [...tasks, { id, ...value, completed: false }];
}

// Замена title, priority, categoryId найденной записи.
export function updateTask(tasks, id, value) {
  let changed = false;
  const next = tasks.map(task => {
    if (task.id === id) {
      changed = true;
      return {
        ...task,
        title: value.title,
        priority: value.priority,
        categoryId: value.categoryId,
      };
    }
    return task;
  });
  return changed ? next : tasks;
}

// Инвертирование completed только у найденной задачи.
export function toggleTask(tasks, id) {
  let changed = false;
  const next = tasks.map(task => {
    if (task.id === id) {
      changed = true;
      return { ...task, completed: !task.completed };
    }
    return task;
  });
  return changed ? next : tasks;
}

// Удаление задачи по id.
export function removeTask(tasks, id) {
  const next = tasks.filter(task => task.id !== id);
  return next.length === tasks.length ? tasks : next;
}
