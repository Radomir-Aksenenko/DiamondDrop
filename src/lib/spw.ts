import SPWMini from 'spwmini/client';

// Инициализация SPWMini с указанным ID приложения
const spw = new SPWMini('31de9a96-221c-4dca-b817-28a3aa5de556', {
  // Отключаем автоинициализацию для работы с Next.js
  autoinit: false
});

// Экспортируем экземпляр для использования в других компонентах
export default spw;

// cbf8f8bc-3d0f-4182-abc2-7eb415822755