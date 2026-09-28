"use strict";

// Входные данные (Вариант 1)
const totalTasks = 12;
const completedTasks = 5;
const dailyLimit = 3;

// Проверка входных данных задач и дневной нормы
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
  console.log("Ошибка: некорректный тип данных задач.");
} else if (!Number.isInteger(totalTasks) || !Number.isInteger(completedTasks)) {
  console.log("Ошибка: дробное количество задач.");
} else if (totalTasks < 0 || completedTasks < 0) {
  console.log("Ошибка: количество задач не может быть отрицательным.");
} else if (totalTasks > 1000) {
  console.log("Ошибка: превышена верхняя граница общего числа задач.");
} else if (completedTasks > totalTasks) {
  console.log("Ошибка: некорректное число выполненных задач.");
} else if (typeof dailyLimit === "string") {
  console.log("Ошибка: дневная норма задана строкой.");
} else if (Number.isNaN(dailyLimit) || typeof dailyLimit !== "number" || !Number.isFinite(dailyLimit)) {
  console.log("Ошибка: недопустимое значение дневной нормы.");
} else if (!Number.isInteger(dailyLimit)) {
  console.log("Ошибка: дробной дневной нормы быть не должно.");
} else if (dailyLimit < 1) {
  console.log("Ошибка: дневная норма должна быть не менее 1.");
} else if (dailyLimit > 1000) {
  console.log("Ошибка: превышена верхняя граница нормы.");
} else {
  // Расчет остатка задач
  let remainingTasks = totalTasks - completedTasks;
  console.log(`Осталось задач: ${remainingTasks}`);

  // Если все задачи уже выполнены, цикл не запускается
  if (remainingTasks === 0) {
    console.log("Все задачи уже выполнены.");
    console.log("Потребуется дней: 0");
  } else {
    let day = 0;

    // Пошаговое планирование выполнения оставшихся задач
    while (remainingTasks > 0) {
      day += 1;
      const tasksToday = Math.min(dailyLimit, remainingTasks);
      remainingTasks -= tasksToday;
      console.log(`День ${day}: выполнено ${tasksToday}, осталось ${remainingTasks}`);
    }

    console.log(`Потребуется дней: ${day}`);
  }
}
