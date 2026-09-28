"use strict";

// Входные данные (Вариант 7: totalTasks = 10, completedTasks = 7)
const totalTasks = 10;
const completedTasks = 7;

// Проверка корректности типов и формата входных данных
if (typeof totalTasks === "string" || typeof completedTasks === "string") {
  console.log("Ошибка: вместо числа передана строка.");
} else if (Number.isNaN(totalTasks) || Number.isNaN(completedTasks)) {
  console.log("Ошибка: недопустимое числовое значение.");
} else if (
  typeof totalTasks !== "number" ||
  typeof completedTasks !== "number" ||
  !Number.isFinite(totalTasks) ||
  !Number.isFinite(completedTasks)
) {
  console.log("Ошибка: некорректный тип данных.");
} else if (!Number.isInteger(totalTasks) || !Number.isInteger(completedTasks)) {
  console.log("Ошибка: дробное количество задач.");
} else if (totalTasks < 0 || completedTasks < 0) {
  console.log("Ошибка: количество задач не может быть отрицательным.");
} else if (totalTasks > 1000) {
  console.log("Ошибка: превышена верхняя граница (максимум 1000).");
} else if (completedTasks > totalTasks) {
  console.log("Ошибка: выполнено больше, чем существует.");
} else if (totalTasks === 0 && completedTasks === 0) {
  console.log("Задач пока нет");
} else {
  // Расчет оставшихся задач, процента выполнения и статуса
  const remainingTasks = totalTasks - completedTasks;
  const progressPercent = ((completedTasks / totalTasks) * 100).toFixed(1);

  let status = "В работе";
  if (completedTasks === 0) {
    status = "Не начато";
  } else if (completedTasks === totalTasks) {
    status = "Завершено";
  }

  console.log(`Всего задач: ${totalTasks}`);
  console.log(`Выполнено: ${completedTasks}`);
  console.log(`Осталось: ${remainingTasks}`);
  console.log(`Прогресс: ${progressPercent}%`);
  console.log(`Статус: ${status}`);
}
