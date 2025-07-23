import SPWMini from 'spwmini/client';

// Инициализация SPWMini с указанным ID приложения
const spw = new SPWMini('cbf8f8bc-3d0f-4182-abc2-7eb415822755', {
  // Отключаем автоинициализацию для работы с Next.js
  autoinit: false
});

// Обработчик события инициализации для вывода информации о пользователе
spw.on('initResponse', user => {
  console.log(`Logged in as ${user.username} / ${user.minecraftUUID}`);
  console.log('Полные данные пользователя:', user);
});

// Обработчик ошибок инициализации
spw.on('initError', message => {
  console.error(`Log in error: ${message}`);
});

// Обработчик события готовности приложения
spw.on('ready', () => {
  console.log('App is ready!');
  console.log('Current user:', spw.user);
  console.log('Все данные SPW объекта:', spw);
});

// Экспортируем экземпляр для использования в других компонентах
export default spw;