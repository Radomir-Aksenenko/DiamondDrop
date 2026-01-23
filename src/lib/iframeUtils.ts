/**
 * Утилиты для определения контекста загрузки приложения
 */

/**
 * Проверяет, открыт ли сайт в iframe от SPWorlds
 * @returns true если сайт открыт в iframe от SPWorlds
 */
export function isInSPWorldsFrame(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // Проверяем, что мы находимся в iframe
  const isInFrame = window.self !== window.top;
  
  if (!isInFrame) {
    return false;
  }

  // Проверяем, что родительское окно - это SPWorlds
  try {
    // Пытаемся получить информацию о родительском окне
    const parentOrigin = window.parent.location.origin;
    
    // Проверяем домены SPWorlds
    const spworldsDomains = [
      'spworlds.ru',
      'www.spworlds.ru',
      'spworlds.org',
      'www.spworlds.org'
    ];
    
    return spworldsDomains.some(domain => 
      parentOrigin.includes(domain)
    );
  } catch (e) {
    // Если не можем получить доступ к родительскому окну (cross-origin),
    // это может быть iframe от SPWorlds
    // Проверяем по URL параметрам или другим признакам
    const urlParams = new URLSearchParams(window.location.search);
    const spwParam = urlParams.get('spw');
    
    // Если есть параметр spw, вероятно это запрос от SPWorlds
    if (spwParam) {
      return true;
    }
    
    // Проверяем referrer (если доступен)
    try {
      const referrer = document.referrer;
      if (referrer) {
        const referrerUrl = new URL(referrer);
        const spworldsDomains = [
          'spworlds.ru',
          'www.spworlds.ru',
          'spoverlay.ru',
          'www.spoverlay.ru'
        ];
        
        if (spworldsDomains.some(domain => referrerUrl.hostname.includes(domain))) {
          return true;
        }
      }
    } catch (err) {
      // Игнорируем ошибки при проверке referrer
    }
    
    // Если мы в iframe и не можем проверить родителя, предполагаем что это может быть SPWorlds
    // Но лучше вернуть false, чтобы показать Discord авторизацию
    return false;
  }
}

/**
 * Проверяет, открыт ли сайт напрямую (не в iframe)
 * @returns true если сайт открыт напрямую
 */
export function isDirectAccess(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return window.self === window.top;
}

