export default function TaskFilters({ filters, categories = [], onChange }) {
  const currentFilters = {
    q: '',
    completed: '',
    priority: '',
    categoryId: '',
    ...filters,
  };

  const handleFieldChange = (name, value) => {
    onChange({ ...currentFilters, [name]: value });
  };

  const handleReset = () => {
    onChange({ q: '', completed: '', priority: '', categoryId: '' });
  };

  return (
    <section aria-label="Фильтры">
      <h2>Фильтры</h2>

      <label htmlFor="filter-q">Поиск по названию:</label>
      <input
        id="filter-q"
        name="q"
        type="search"
        placeholder="Поиск..."
        value={currentFilters.q}
        onChange={e => handleFieldChange('q', e.target.value)}
      />

      <label htmlFor="filter-completed">Статус выполнения:</label>
      <select
        id="filter-completed"
        name="completed"
        value={currentFilters.completed}
        onChange={e => handleFieldChange('completed', e.target.value)}
      >
        <option value="">Все статусы</option>
        <option value="false">В работе (активные)</option>
        <option value="true">Выполненные</option>
      </select>

      <label htmlFor="filter-priority">Приоритет:</label>
      <select
        id="filter-priority"
        name="priority"
        value={currentFilters.priority}
        onChange={e => handleFieldChange('priority', e.target.value)}
      >
        <option value="">Все приоритеты</option>
        <option value="low">Низкий (low)</option>
        <option value="medium">Средний (medium)</option>
        <option value="high">Высокий (high)</option>
      </select>

      <label htmlFor="filter-category">Категория:</label>
      <select
        id="filter-category"
        name="categoryId"
        value={currentFilters.categoryId}
        onChange={e => handleFieldChange('categoryId', e.target.value)}
      >
        <option value="">Все категории</option>
        {categories.map(category => (
          <option key={category.id} value={String(category.id)}>
            {category.name}
          </option>
        ))}
      </select>

      <div style={{ marginTop: '12px' }}>
        <button type="button" onClick={handleReset}>
          Сбросить фильтры
        </button>
      </div>
    </section>
  );
}
