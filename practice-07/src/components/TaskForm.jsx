import { useState } from 'react';
import { validateTaskDraft } from '../domain/task-service.js';

export default function TaskForm({ categories = [], initialTask = null, onSave, onCancel }) {
  const isEditing = initialTask !== null;

  const defaultCategory = categories[0]?.id ? String(categories[0].id) : '1';

  const [title, setTitle] = useState(() => initialTask?.title ?? '');
  const [priority, setPriority] = useState(() => initialTask?.priority ?? 'medium');
  const [categoryId, setCategoryId] = useState(() =>
    initialTask?.categoryId ? String(initialTask.categoryId) : defaultCategory
  );
  const [errors, setErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    const validation = validateTaskDraft({ title, priority, categoryId }, categories);

    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    const success = onSave(validation.value);
    if (success) {
      setGeneralError('');
      if (!isEditing) {
        setTitle('');
        setPriority('medium');
        setCategoryId(defaultCategory);
      }
    } else {
      setGeneralError('Не удалось сохранить задачу. Возможно, запись уже была удалена.');
    }
  };

  return (
    <section aria-label="Форма задачи">
      <h2>{isEditing ? `Редактирование задачи #${initialTask.id}` : 'Создание новой задачи'}</h2>

      {generalError && (
        <p role="alert" className="error">
          {generalError}
        </p>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div>
          <label htmlFor="task-title">Название задачи:</label>
          <input
            id="task-title"
            name="title"
            type="text"
            placeholder="Введите название задачи (от 1 до 100 символов)..."
            value={title}
            onChange={e => {
              setTitle(e.target.value);
              if (errors.title) setErrors(prev => ({ ...prev, title: undefined }));
            }}
          />
          {errors.title && (
            <div className="error" role="alert" style={{ fontSize: '13px', marginTop: '4px' }}>
              {errors.title}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="task-priority">Приоритет:</label>
          <select
            id="task-priority"
            name="priority"
            value={priority}
            onChange={e => {
              setPriority(e.target.value);
              if (errors.priority) setErrors(prev => ({ ...prev, priority: undefined }));
            }}
          >
            <option value="low">Низкий (low)</option>
            <option value="medium">Средний (medium)</option>
            <option value="high">Высокий (high)</option>
          </select>
          {errors.priority && (
            <div className="error" role="alert" style={{ fontSize: '13px', marginTop: '4px' }}>
              {errors.priority}
            </div>
          )}
        </div>

        <div>
          <label htmlFor="task-category">Категория:</label>
          <select
            id="task-category"
            name="categoryId"
            value={categoryId}
            onChange={e => {
              setCategoryId(e.target.value);
              if (errors.categoryId) setErrors(prev => ({ ...prev, categoryId: undefined }));
            }}
          >
            {categories.map(category => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.categoryId && (
            <div className="error" role="alert" style={{ fontSize: '13px', marginTop: '4px' }}>
              {errors.categoryId}
            </div>
          )}
        </div>

        <div style={{ marginTop: '16px' }} className="actions">
          <button type="submit">
            {isEditing ? 'Сохранить изменения' : 'Добавить задачу'}
          </button>
          {isEditing && (
            <button type="button" onClick={onCancel}>
              Отмена
            </button>
          )}
        </div>
      </form>
    </section>
  );
}
