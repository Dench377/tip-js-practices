export default function TaskItem({ task, categoryName, onToggle, onEdit, onDelete }) {
  const handleDeleteClick = () => {
    if (window.confirm(`Удалить задачу "${task.title}"?`)) {
      onDelete(task.id);
    }
  };

  const priorityLabels = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
  };

  return (
    <li>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <input
          type="checkbox"
          id={`task-toggle-${task.id}`}
          checked={task.completed}
          onChange={() => onToggle(task.id)}
          aria-label={`Отметить задачу "${task.title}"`}
        />
        <span
          style={{
            textDecoration: task.completed ? 'line-through' : 'none',
            color: task.completed ? '#64748b' : '#0f172a',
            fontWeight: 500,
            fontSize: '15px',
          }}
        >
          {task.title}
        </span>
      </div>

      <div style={{ marginTop: '6px', fontSize: '13px', color: '#475569' }}>
        <span>Категория: <strong>{categoryName}</strong></span>
        {' | '}
        <span>Приоритет: <strong>{priorityLabels[task.priority] ?? task.priority}</strong></span>
        {' | '}
        <span>Статус: <strong>{task.completed ? 'Выполнена' : 'В работе'}</strong></span>
      </div>

      <div className="actions" style={{ marginTop: '8px' }}>
        <button type="button" onClick={() => onEdit(task.id)}>
          Редактировать
        </button>
        <button type="button" onClick={handleDeleteClick}>
          Удалить
        </button>
      </div>
    </li>
  );
}
