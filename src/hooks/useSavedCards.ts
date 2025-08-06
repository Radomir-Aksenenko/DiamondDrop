'use client';

import { useState, useCallback, useEffect } from 'react';

const SAVED_CARDS_KEY = 'diamond_drop_saved_cards';
const MAX_SAVED_CARDS = 4;

/**
 * Хук для работы с сохраненными картами в localStorage
 */
export default function useSavedCards() {
  const [savedCards, setSavedCards] = useState<string[]>([]);

  /**
   * Получает значение из localStorage по ключу
   */
  const getStorageValue = useCallback((key: string): string | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Ошибка при чтении из localStorage:', error);
      return null;
    }
  }, []);

  // Загружаем сохраненные карты из localStorage при инициализации
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = getStorageValue(SAVED_CARDS_KEY);
      if (saved) {
        try {
          const cards = JSON.parse(saved);
          if (Array.isArray(cards)) {
            setSavedCards(cards);
            console.log('Saved cards loaded from localStorage:', cards);
          }
        } catch (error) {
          console.error('Ошибка при загрузке сохраненных карт:', error);
        }
      }
    }
  }, [getStorageValue]);

  /**
   * Устанавливает значение в localStorage
   */
  const setStorageValue = useCallback((key: string, value: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Ошибка при записи в localStorage:', error);
    }
  }, []);

  /**
   * Сохраняет карты в localStorage
   */
  const saveCardsToStorage = useCallback((cards: string[]) => {
    setStorageValue(SAVED_CARDS_KEY, JSON.stringify(cards));
    console.log('Cards saved to localStorage:', cards);
  }, [setStorageValue]);

  /**
   * Добавляет новую карту в список сохраненных
   * @param cardNumber - номер карты для добавления
   */
  const addCard = useCallback((cardNumber: string) => {
    if (!cardNumber || cardNumber.length !== 5) {
      console.warn('Attempt to add invalid card:', cardNumber);
      return;
    }

    console.log('Adding card:', cardNumber);

    setSavedCards(prevCards => {
      // Проверяем, есть ли уже такая карта
      const existingIndex = prevCards.indexOf(cardNumber);
      
      let newCards: string[];
      
      if (existingIndex !== -1) {
        // Карта уже есть - перемещаем её в начало
        console.log('Card already exists, moving to top');
        newCards = [cardNumber, ...prevCards.filter(card => card !== cardNumber)];
      } else {
        // Новая карта - добавляем в начало
        console.log('Adding new card');
        newCards = [cardNumber, ...prevCards];
        
        // Ограничиваем количество сохраненных карт
        if (newCards.length > MAX_SAVED_CARDS) {
          newCards = newCards.slice(0, MAX_SAVED_CARDS);
          console.log('Trimming list to maximum card count');
        }
      }
      
      // Сохраняем в localStorage
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