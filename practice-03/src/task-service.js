// Модуль работы с задачами: чистые функции без мутации входных данных

// Вспомогательная проверка корректности идентификатора
function isValidId(id) {
  return typeof id === "number" && Number.isSafeInteger(id) && id > 0;
}

// Вспомогательная проверка и нормализация названия задачи
function validateTitle(title) {
  if (typeof title !== "string") {
    return { ok: false, error: "Название должно быть строкой" };
  }
  const trimmed = title.trim();
  if (trimmed.length < 1 || trimmed.length > 100) {
    return { ok: false, error: "Длина названия должна быть от 1 до 100 символов" };
  }
  return { ok: true, title: trimmed };
}

// 1. Создание задачи с валидацией полей
export function createTask(id, title, priority = "medium") {
  if (!isValidId(id)) {
    return { ok: false, error: "Идентификатор должен быть положительным целым числом" };
  }

  const titleResult = validateTitle(title);
  if (!titleResult.ok) {
    return titleResult;
  }

  if (priority !== "low" && priority !== "medium" && priority !== "high") {
    return { ok: false, error: "Приоритет должен быть 'low', 'medium' или 'high'" };
  }

  return {
    ok: true,
    task: {
      id,
      title: titleResult.title,
      completed: false,
      priority,
    },
  };
}

// 2. Поиск задачи по id (строгое сравнение, возвращает найденный объект или undefined)
export function findTaskById(tasks, id) {
  return tasks.find((task) => task.id === id);
}

// 3. Получение нового массива невыполненных задач
export function getPendingTasks(tasks) {
  return tasks.filter((task) => task.completed === false);
}

// 4. Получение массива названий задач
export function getTaskTitles(tasks) {
  return tasks.map((task) => task.title);
}

// 5. Расчет числовой сводки по переданному списку задач
export function getTaskStats(tasks) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed === true).length;
  const pending = total - completed;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return { total, completed, pending, progress };
}

// 6. Добавление задачи в конец нового массива без мутации исходного
export function addTask(tasks, id, title, priority = "medium") {
  const createResult = createTask(id, title, priority);
  if (!createResult.ok) {
    return createResult;
  }

  const existing = findTaskById(tasks, id);
  if (existing !== undefined) {
    return { ok: false, error: "Задача с указанным id уже существует" };
  }

  return {
    ok: true,
    tasks: [...tasks, createResult.task],
  };
}

// 7. Изменение признака завершенности задачи
export function setTaskCompleted(tasks, id, completed) {
  if (!isValidId(id)) {
    return { ok: false, error: "Некорректный идентификатор задачи" };
  }
  if (typeof completed !== "boolean") {
    return { ok: false, error: "Статус completed должен быть логическим значением" };
  }

  const task = findTaskById(tasks, id);
  if (task === undefined) {
    return { ok: false, error: "Задача не найдена" };
  }

  const updatedTasks = tasks.map((item) =>
    item.id === id ? { ...item, completed } : item
  );

  return { ok: true, tasks: updatedTasks };
}

// 8. Изменение названия задачи
export function renameTask(tasks, id, title) {
  if (!isValidId(id)) {
    return { ok: false, error: "Некорректный идентификатор задачи" };
  }

  const titleResult = validateTitle(title);
  if (!titleResult.ok) {
    return titleResult;
  }

  const task = findTaskById(tasks, id);
  if (task === undefined) {
    return { ok: false, error: "Задача не найдена" };
  }

  const updatedTasks = tasks.map((item) =>
    item.id === id ? { ...item, title: titleResult.title } : item
  );

  return { ok: true, tasks: updatedTasks };
}

// 9. Удаление задачи по идентификатору
export function removeTask(tasks, id) {
  if (!isValidId(id)) {
    return { ok: false, error: "Некорректный идентификатор задачи" };
  }

  const task = findTaskById(tasks, id);
  if (task === undefined) {
    return { ok: false, error: "Задача не найдена" };
  }

  const updatedTasks = tasks.filter((item) => item.id !== id);

  return { ok: true, tasks: updatedTasks };
}
