'use client';

import { useState, useCallback, useEffect } from 'react';

const SAVED_CARDS_KEY = 'diamond_drop_saved_cards';
const MAX_SAVED_CARDS = 4;

/**
 * Хук для работы с сохраненными картами в куки
 */
export default function useSavedCards() {
  const [savedCards, setSavedCards] = useState<string[]>([]);

  /**
   * Получает значение куки по ключу
   */
  const getCookieValue = useCallback((key: string): string | null => {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [cookieKey, cookieValue] = cookie.trim().split('=');
      if (cookieKey === key) {
        return decodeURIComponent(cookieValue);
      }
    }
    return null;
  }, []);

  // Загружаем сохраненные карты из куки при инициализации
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = getCookieValue(SAVED_CARDS_KEY);
      if (saved) {
        try {
          const cards = JSON.parse(saved);
          if (Array.isArray(cards)) {
            setSavedCards(cards);
          }
        } catch (error) {
          console.error('Ошибка при загрузке сохраненных карт:', error);
        }
      }
    }
  }, [getCookieValue]);

  /**
   * Устанавливает значение куки
   */
  const setCookieValue = useCallback((key: string, value: string, days: number = 30) => {
    if (typeof document === 'undefined') return;
    
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    
    document.cookie = `${key}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
  }, []);

  /**
   * Сохраняет карты в куки
   */
  const saveCardsToStorage = useCallback((cards: string[]) => {
    setCookieValue(SAVED_CARDS_KEY, JSON.stringify(cards));
  }, [setCookieValue]);

  /**
   * Добавляет новую карту в список сохраненных
   * @param cardNumber - номер карты для добавления
   */
  const addCard = useCallback((cardNumber: string) => {
    if (!cardNumber || cardNumber.length !== 5) {
      return;
    }

    setSavedCards(prevCards => {
      // Проверяем, есть ли уже такая карта
      const existingIndex = prevCards.indexOf(cardNumber);
      
      let newCards: string[];
      
      if (existingIndex !== -1) {
        // Карта уже есть - перемещаем её в начало
        newCards = [cardNumber, ...prevCards.filter(card => card !== cardNumber)];
      } else {
        // Новая карта - добавляем в начало
        newCards = [cardNumber, ...prevCards];
        
        // Ограничиваем количество сохраненных карт
        if (newCards.length > MAX_SAVED_CARDS) {
          newCards = newCards.slice(0, MAX_SAVED_CARDS);
        }
      }
      
      // Сохраняем в куки
      saveCardsToStorage(newCards);
      
      return newCards;
    });
  }, [saveCardsToStorage]);

  /**
   * Удаляет карту из списка сохраненных
   * @param cardNumber - номер карты для удаления
   */
  const removeCard = useCallback((cardNumber: string) => {
    setSavedCards(prevCards => {
      const newCards = prevCards.filter(card => card !== cardNumber);
      saveCardsToStorage(newCards);
      return newCards;
    });
  }, [saveCardsToStorage]);

  /**
   * Очищает все сохраненные карты
   */
  const clearCards = useCallback(() => {
    setSavedCards([]);
    saveCardsToStorage([]);
  }, [saveCardsToStorage]);

  return {
    savedCards,
    addCard,
    removeCard,
    clearCards,
  };
}