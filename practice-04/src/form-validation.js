const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

// Чистая проверка данных формы: валидация черновика задачи без обращения к DOM
export function validateTaskDraft(draft, tasks, editingId = null) {
  const errors = {};
  let validId;
  let validTitle;
  let validPriority;

  // 1. Проверка идентификатора
  if (editingId !== null && editingId !== undefined) {
    const editNum = Number(editingId);
    if (!Number.isSafeInteger(editNum) || editNum <= 0) {
      errors.id = "Некорректный идентификатор редактируемой задачи";
    } else if (!Array.isArray(tasks) || !tasks.some((t) => t.id === editNum)) {
      errors.id = "Редактируемая задача не найдена";
    } else {
      validId = editNum;
    }
  } else {
    if (draft === null || draft === undefined || draft.id === undefined || draft.id === null || draft.id === "") {
      errors.id = "Идентификатор обязателен для заполнения";
    } else {
      const isString = typeof draft.id === "string";
      if (isString && !/^\s*\d+\s*$/.test(draft.id)) {
        errors.id = "Идентификатор должен быть положительным целым числом";
      } else {
        const numId = Number(draft.id);
        if (!Number.isSafeInteger(numId) || numId <= 0) {
          errors.id = "Идентификатор должен быть положительным целым числом";
        } else if (Array.isArray(tasks) && tasks.some((t) => t.id === numId)) {
          errors.id = "Задача с таким идентификатором уже существует";
        } else {
          validId = numId;
        }
      }
    }
  }

  // 2. Проверка названия (title)
  if (!draft || typeof draft.title !== "string") {
    errors.title = "Название должно быть строкой";
  } else {
    const trimmed = draft.title.trim();
    if (trimmed.length < 1 || trimmed.length > 100) {
      errors.title = "Длина названия должна быть от 1 до 100 символов";
    } else {
      validTitle = trimmed;
    }
  }

  // 3. Проверка приоритета (priority)
  if (!draft || typeof draft.priority !== "string" || !ALLOWED_PRIORITIES.has(draft.priority)) {
    errors.priority = "Приоритет должен быть 'low', 'medium' или 'high'";
  } else {
    validPriority = draft.priority;
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      id: validId,
      title: validTitle,
      priority: validPriority,
    },
  };
}
