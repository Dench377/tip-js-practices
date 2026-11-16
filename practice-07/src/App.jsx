import { useState } from 'react';
import { tasks as initialTasks, categories } from './data.js';
import { variant, createInitialFilters } from './variant.js';
import {
  selectTasks,
  getTaskStats,
  addTask,
  updateTask,
  toggleTask,
  removeTask,
} from './domain/task-service.js';
import TaskForm from './components/TaskForm.jsx';
import TaskFilters from './components/TaskFilters.jsx';
import TaskList from './components/TaskList.jsx';
import TaskStats from './components/TaskStats.jsx';

export default function App() {
  const [tasks, setTasks] = useState(() => initialTasks.map(task => ({ ...task })));
  const [filters, setFilters] = useState(createInitialFilters);
  const [editingId, setEditingId] = useState(null);

  // Вычисляемые данные на каждом рендере (без избыточных useEffect)
  const visibleTasks = selectTasks(tasks, filters);
  const stats = getTaskStats(tasks);
  const editingTask = editingId !== null ? tasks.find(t => t.id === editingId) ?? null : null;

  const handleToggle = id => {
    setTasks(prev => toggleTask(prev, id));
  };

  const handleEdit = id => {
    setEditingId(id);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const handleDelete = id => {
    setTasks(prev => removeTask(prev, id));
    if (editingId === id) {
      setEditingId(null);
    }
  };

  const handleSave = value => {
    if (editingId !== null) {
      const exists = tasks.some(task => task.id === editingId);
      if (!exists) {
        return false;
      }
      setTasks(prev => updateTask(prev, editingId, value));
      setEditingId(null);
      return true;
    }

    const nextId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    setTasks(prev => addTask(prev, value, nextId));
    return true;
  };

  return (
    <main>
      <h1>Задачи на React</h1>
      <p>
        Практическая работа № 7: компонентный интерфейс на React с данными в памяти.
        Обновление страницы восстанавливает исходный набор. Вариант {variant} (начальный фильтр: <code>q="провер"</code>).
      </p>

      <TaskStats stats={stats} />
      <TaskFilters filters={filters} categories={categories} onChange={setFilters} />
      <TaskForm
        key={editingId ?? 'new'}
        categories={categories}
        initialTask={editingTask}
        onSave={handleSave}
        onCancel={handleCancelEdit}
      />
      <TaskList
        tasks={visibleTasks}
        categories={categories}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </main>
  );
}
