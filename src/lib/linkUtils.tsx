import React from 'react';
import useSPW from '@/hooks/useSPW';

/**
 * Утилита для обработки внешних ссылок
 * Открывает внешние ссылки через SPM, кроме ссылок на diamond-drop-spm.vercel.app
 */

/**
 * Проверяет, является ли URL внешней ссылкой
 * @param url - URL для проверки
 * @returns true если ссылка внешняя
 */
export function isExternalLink(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const currentHost = window.location.hostname;
    
    // Проверяем, что это не относительная ссылка и не ссылка на текущий домен
    return urlObj.hostname !== currentHost;
  } catch {
    // Если URL невалидный, считаем его внутренней ссылкой
    return false;
  }
}

/**
 * Проверяет, нужно ли открывать ссылку через SPM
 * @param url - URL для проверки
 * @returns true если ссылку нужно открывать через SPM
 */
export function shouldOpenWithSPM(url: string): boolean {
  try {
    const urlObj = new URL(url);
    
    // Не открываем через SPM ссылки на diamond-drop-spm.vercel.app
    if (urlObj.hostname === 'diamond-drop-spm.vercel.app') {
      return false;
    }
    
    // Открываем через SPM только https ссылки (требование SPM)
    return urlObj.protocol === 'https:' && isExternalLink(url);
  } catch {
    return false;
  }
}

/**
 * Хук для обработки ссылок с использованием SPM
 * @returns функция для обработки клика по ссылке
 */
export function useLinkHandler() {
  const { openURL } = useSPW();

  /**
   * Обрабатывает клик по ссылке
   * @param url - URL для открытия
   * @param event - событие клика (опционально)
   */
  const handleLinkClick = (url: string, event?: React.MouseEvent) => {
    if (shouldOpenWithSPM(url)) {
      // Предотвращаем стандартное поведение ссылки
      if (event) {
        event.preventDefault();
      }
      
      // Открываем через SPM
      openURL(url);
    } else {
      // Для внутренних ссылок или ссылок на diamond-drop-spm.vercel.app
      // позволяем стандартное поведение
      if (isExternalLink(url) && !shouldOpenWithSPM(url)) {
        // Для внешних ссылок, которые не должны открываться через SPM
        // открываем в новом окне
        if (event) {
          event.preventDefault();
        }
        window.open(url, '_blank', 'noopener,noreferrer');
      }
      // Для внутренних ссылок ничего не делаем - пусть работает стандартная навигация
    }
  };

  return { handleLinkClick };
}

/**
 * Компонент-обертка для ссылок с автоматической обработкой через SPM
 */
export interface SmartLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: (event: React.MouseEvent) => void;
  [key: string]: any;
}

export function SmartLink({ href, children, className, onClick, ...props }: SmartLinkProps) {
  const { handleLinkClick } = useLinkHandler();

  const handleClick = (event: React.MouseEvent) => {
    // Сначала вызываем пользовательский обработчик, если есть
    if (onClick) {
      onClick(event);
    }
    
    // Затем обрабатываем ссылку
    handleLinkClick(href, event);
  };

  return (
    <a 
      href={href} 
      className={className} 
      onClick={handleClick}
      {...props}
    >
      {children}
    </a>
  );
}