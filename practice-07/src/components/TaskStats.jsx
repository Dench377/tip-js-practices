export default function TaskStats({ stats }) {
  const total = stats?.total ?? 0;
  const completed = stats?.completed ?? 0;
  const active = stats?.active ?? 0;

  return (
    <section aria-label="Статистика">
      <h2>Статистика</h2>
      <p>
        Всего задач: <strong>{total}</strong> | Выполнено: <strong>{completed}</strong> | В работе: <strong>{active}</strong>
      </p>
    </section>
  );
}
