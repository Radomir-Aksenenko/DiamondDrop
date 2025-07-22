import SPWMini from 'spwmini/client';

// Инициализация SPWMini с указанным ID приложения
const spw = new SPWMini('4100e232-6ec0-488a-b266-0eb6b95d468a', {
  // Отключаем автоинициализацию для работы с Next.js
  autoinit: false
});

// Экспортируем экземпляр для использования в других компонентах
export default spw;