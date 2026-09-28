"use strict";

// 1. Сложение строки и числа (конкатенация)
const exp1 = "8" + 2;
console.log("1. '8' + 2 -> Значение:", exp1, "| Тип:", typeof exp1);

// 2. Вычитание числа из строки (неявное числовое преобразование)
const exp2 = "8" - 2;
console.log("2. '8' - 2 -> Значение:", exp2, "| Тип:", typeof exp2);

// 3. Явное преобразование строки в число с последующим сложением
const exp3 = Number("8") + 2;
console.log("3. Number('8') + 2 -> Значение:", exp3, "| Тип:", typeof exp3);

// 4. Посимвольное (лексикографическое) сравнение строк
const exp4 = "12" > "3";
console.log("4. '12' > '3' -> Значение:", exp4, "| Тип:", typeof exp4);

// 5. Строгое сравнение без приведения типов
const exp5 = 12 === "12";
console.log("5. 12 === '12' -> Значение:", exp5, "| Тип:", typeof exp5);

// 6. Преобразование пустой строки в число
const exp6 = Number("");
console.log("6. Number('') -> Значение:", exp6, "| Тип:", typeof exp6);

// 7. Преобразование нечисловой строки в число
const exp7 = Number("text");
console.log("7. Number('text') -> Значение:", exp7, "| Тип:", typeof exp7);

// 8. Логическое преобразование непустой строки
const exp8 = Boolean("false");
console.log("8. Boolean('false') -> Значение:", exp8, "| Тип:", typeof exp8);

// 9. Определение типа null (значение выражения и тип результата)
const exp9 = typeof null;
console.log("9. typeof null -> Значение:", exp9, "| Тип результата:", typeof exp9);

// 10. Определение типа NaN (значение выражения и тип результата)
const exp10 = typeof NaN;
console.log("10. typeof NaN -> Значение:", exp10, "| Тип результата:", typeof exp10);
