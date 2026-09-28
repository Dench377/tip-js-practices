"use strict";

// Исходные строковые данные (моделируют получение данных из текстового ввода)
const plannedText = "8";
const completedText = "3";
const additionalText = "2";

// Исправление ошибки 1: преобразование строк в числа с помощью Number()
// В исходном коде: completedText + additionalText давало конкатенацию "32"
const completedTotal = Number(completedText) + Number(additionalText);
const remainingTasks = Number(plannedText) - completedTotal;

console.log("Выполнено:", completedTotal);
console.log("Осталось:", remainingTasks);

let controlSum = 0;

// Исправление ошибки 2: включение 4 в условие цикла (taskNumber <= 4)
// В исходном коде строгое неравенство < 4 пропускало последнюю задачу
for (let taskNumber = 1; taskNumber <= 4; taskNumber += 1) {
  controlSum += taskNumber;
}

console.log("Контрольная сумма:", controlSum);
