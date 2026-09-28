"use strict";

// Входные данные (Контрольный пример: 6 задач, 0 выполнено, норма 1 в день)
const totalTasks = 6;
const completedTasks = 0;
const dailyLimit = 1;

// Проверка входных данных
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
  let remainingTasks = totalTasks - completedTasks;
  console.log(`Осталось задач: ${remainingTasks}`);

  if (remainingTasks === 0) {
    console.log("Все задачи уже выполнены.");
    console.log("Рабочих дней: 0");
    console.log("Календарных дней: 0");
  } else {
    let calendarDays = 0;
    let workingDays = 0;

    // Цикл по календарным дням до завершения всех задач
    while (remainingTasks > 0) {
      calendarDays += 1;
      const dayOfWeek = ((calendarDays - 1) % 7) + 1;

      let dayName = "Понедельник";
      if (dayOfWeek === 2) dayName = "Вторник";
      else if (dayOfWeek === 3) dayName = "Среда";
      else if (dayOfWeek === 4) dayName = "Четверг";
      else if (dayOfWeek === 5) dayName = "Пятница";
      else if (dayOfWeek === 6) dayName = "Суббота";
      else if (dayOfWeek === 7) dayName = "Воскресенье";

      // Суббота (6) и воскресенье (7) — выходные дни
      if (dayOfWeek === 6 || dayOfWeek === 7) {
        console.log(`День ${calendarDays} (${dayName}): выходной, осталось ${remainingTasks}`);
      } else {
        workingDays += 1;
        const tasksToday = Math.min(dailyLimit, remainingTasks);
        remainingTasks -= tasksToday;
        console.log(`День ${calendarDays} (${dayName}): выполнено ${tasksToday}, осталось ${remainingTasks}`);
      }
    }

    console.log(`Итого рабочих дней: ${workingDays}`);
    console.log(`Итого календарных дней: ${calendarDays}`);
  }
}
