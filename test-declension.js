// Тест функции склонения слова "предмет"
function getItemsCountText(count) {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;
  
  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return `${count} предметов`;
  }
  
  if (lastDigit === 1) {
    return `${count} предмет`;
  }
  
  if (lastDigit >= 2 && lastDigit <= 4) {
    return `${count} предмета`;
  }
  
  return `${count} предметов`;
}

// Тестируем различные случаи
const testCases = [1, 2, 3, 4, 5, 10, 11, 12, 13, 14, 15, 21, 22, 23, 24, 25, 101, 102, 103, 104, 105];

console.log('Тест функции склонения слова "предмет":');
testCases.forEach(count => {
  console.log(getItemsCountText(count));
});