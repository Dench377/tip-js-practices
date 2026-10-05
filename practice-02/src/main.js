import { demoTasks, variantNumber, variantTasks } from "./data.js";
import {
  findTaskById,
  getPendingTasks,
  getTaskTitles,
  getTaskStats,
  addTask,
  setTaskCompleted,
  renameTask,
  removeTask,
} from "./task-service.js";
import { getPrioritySummary, searchTasks } from "./task-extra.js";

// Вспомогательный вывод сводки с деструктуризацией
function printStats(label, tasks) {
  const { total, completed, pending, progress } = getTaskStats(tasks);
  const progressFormatted = total === 0 ? "Задач пока нет" : `${progress.toFixed(1)}%`;
  console.log(`${label} -> Всего: ${total}; Выполнено: ${completed}; Осталось: ${pending}; Прогресс: ${progressFormatted}`);
}

console.log("=== Практическая работа № 2. Демонстрационный сценарий ===");
console.log(`Студент: Сидорович Денис Сергеевич | Группа: ЭФБО-17-25 | Вариант: ${variantNumber}`);

console.log("\n--- ЧАСТЬ 1. ОБЩИЙ СЦЕНАРИЙ (demoTasks) ---");
let currentTasks = demoTasks;

console.log("1. Исходные задачи и заголовки:");
console.log("Названия всех задач:", getTaskTitles(currentTasks));
console.log("Невыполненные задачи (id):", getPendingTasks(currentTasks).map((t) => t.id));
printStats("Этап 1 (Исходное состояние)", currentTasks);

console.log("\n2. Добавление задачи id = 20:");
const addResult = addTask(currentTasks, 20, "Добавить проверку", "high");
if (addResult.ok) {
  currentTasks = addResult.tasks;
  printStats("Этап 2 (После addTask id 20)", currentTasks);
} else {
  console.error("Ошибка при добавлении:", addResult.error);
}

console.log("\n3. Установка completed = true для id = 4:");
const completeResult = setTaskCompleted(currentTasks, 4, true);
if (completeResult.ok) {
  currentTasks = completeResult.tasks;
  printStats("Этап 3 (После setTaskCompleted id 4)", currentTasks);
} else {
  console.error("Ошибка изменения статуса:", completeResult.error);
}

console.log("\n4. Переименование задачи id = 10:");
const renameResult = renameTask(currentTasks, 10, "Подготовить инструкцию запуска");
if (renameResult.ok) {
  currentTasks = renameResult.tasks;
  printStats("Этап 4 (После renameTask id 10)", currentTasks);
} else {
  console.error("Ошибка переименования:", renameResult.error);
}

console.log("\n5. Удаление задачи id = 7:");
const removeResult = removeTask(currentTasks, 7);
if (removeResult.ok) {
  currentTasks = removeResult.tasks;
  printStats("Этап 5 (После removeTask id 7)", currentTasks);
} else {
  console.error("Ошибка удаления:", removeResult.error);
}

console.log("\nИтоговые идентификаторы задач общего набора:", currentTasks.map((t) => t.id));

console.log("\n6. Демонстрация обработки ошибок (попытка добавить задачу с существующим id = 4):");
const failAddResult = addTask(currentTasks, 4, "Повторный id");
if (!failAddResult.ok) {
  console.log(`Успешно обработан ожидаемый отказ: "${failAddResult.error}"`);
  console.log("Размер списка задач остался неизменным:", currentTasks.length);
}

console.log("\n7. Проверка неизменности исходного массива demoTasks:");
console.log("Исходный demoTasks содержит элементов:", demoTasks.length);
console.log("Статус задачи id = 4 в исходном demoTasks:", demoTasks.find((t) => t.id === 4)?.completed);
console.log("Исходный массив demoTasks не был мутирован:", demoTasks.length === 4 && demoTasks[1].completed === false);

console.log("\n--- ЧАСТЬ 2. ИНДИВИДУАЛЬНЫЙ СЦЕНАРИЙ (Вариант 7: Подготовка учебного релиза) ---");
let currentVariantTasks = variantTasks;

printStats("Вариант 7 (Исходное состояние)", currentVariantTasks);

console.log("\n1. Добавление задачи id = 80 (приоритет high):");
const varAdd = addTask(currentVariantTasks, 80, "Опубликовать релиз в продакшн", "high");
if (varAdd.ok) {
  currentVariantTasks = varAdd.tasks;
  printStats("После добавления id 80", currentVariantTasks);
}

console.log("\n2. Установка completed = true для id = 11:");
const varComplete = setTaskCompleted(currentVariantTasks, 11, true);
if (varComplete.ok) {
  currentVariantTasks = varComplete.tasks;
  printStats("После подтверждения completed id 11", currentVariantTasks);
}

console.log("\n3. Переименование задачи id = 23:");
const varRename = renameTask(currentVariantTasks, 23, "Выполнить финальное регрессионное тестирование");
if (varRename.ok) {
  currentVariantTasks = varRename.tasks;
  printStats("После переименования id 23", currentVariantTasks);
}

console.log("\n4. Удаление задачи id = 37:");
const varRemove = removeTask(currentVariantTasks, 37);
if (varRemove.ok) {
  currentVariantTasks = varRemove.tasks;
  printStats("После удаления id 37", currentVariantTasks);
}

console.log("\n5. Попытка повторного добавления задачи id = 80:");
const varDupAdd = addTask(currentVariantTasks, 80, "Дубликат релиза", "high");
if (!varDupAdd.ok) {
  console.log(`Ожидаемый отказ: "${varDupAdd.error}"`);
  console.log("Количество задач в варианте не изменилось:", currentVariantTasks.length);
}

console.log("\nИтоговые идентификаторы варианта 7:", currentVariantTasks.map((t) => t.id));
console.log("Исходный массив variantTasks сохранен (длина 6):", variantTasks.length === 6);

console.log("\n--- ЧАСТЬ 3. ДОПОЛНИТЕЛЬНОЕ ЗАДАНИЕ (task-extra.js) ---");
console.log("Сводка по категориям приоритетов (getPrioritySummary):");
console.dir(getPrioritySummary(currentTasks));

console.log("\nПоиск задач со словом 'инструкцию' (searchTasks):");
console.log(searchTasks(currentTasks, "инструкцию").map((t) => `[id: ${t.id}] ${t.title}`));
