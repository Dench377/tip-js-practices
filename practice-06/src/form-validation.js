const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

// Возвращает { valid, value, errors }.
// value содержит нормализованные title, priority и числовой categoryId.
export function validateTaskDraft(draft, categories = []) {
  const errors = {};

  const rawTitle = typeof draft?.title === "string" ? draft.title : "";
  const trimmedTitle = rawTitle.trim();
  if (trimmedTitle.length < 1 || trimmedTitle.length > 100) {
    errors.title = "Название должно содержать от 1 до 100 символов.";
  }

  const rawPriority = draft?.priority;
  if (typeof rawPriority !== "string" || !ALLOWED_PRIORITIES.has(rawPriority)) {
    errors.priority = "Выберите корректный приоритет из списка.";
  }

  const rawCategoryId = Number(draft?.categoryId);
  const categoryExists = Number.isSafeInteger(rawCategoryId)
    && rawCategoryId > 0
    && (categories || []).some((category) => category.id === rawCategoryId);

  if (!categoryExists) {
    errors.categoryId = "Выберите существующую категорию.";
  }

  const valid = Object.keys(errors).length === 0;

  return {
    valid,
    value: {
      title: trimmedTitle,
      priority: rawPriority,
      categoryId: Number.isSafeInteger(rawCategoryId) ? rawCategoryId : null,
    },
    errors,
  };
}
