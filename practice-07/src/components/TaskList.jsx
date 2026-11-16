import TaskItem from './TaskItem.jsx';

export default function TaskList({ tasks = [], categories = [], onToggle, onEdit, onDelete }) {
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));

  return (
    <section aria-label="Список задач">
      <h2>Список задач</h2>
      <p role="status">Найдено задач: <strong>{tasks.length}</strong></p>

      {tasks.length === 0 ? (
        <p>Задачи не найдены. Попробуйте изменить параметры фильтрации или добавить новую задачу.</p>
      ) : (
        <ul>
          {tasks.map(task => (
            <TaskItem
              key={task.id}
              task={task}
              categoryName={categoryMap.get(task.categoryId) ?? 'Без категории'}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
