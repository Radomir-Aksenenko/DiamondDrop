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
      console.error('Error reading from localStorage:', error);
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
          }
        } catch (error) {
          console.error('Error loading saved cards:', error);
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
      console.error('Error writing to localStorage:', error);
    }
  }, []);

  /**
   * Сохраняет карты в localStorage
   */
  const saveCardsToStorage = useCallback((cards: string[]) => {
    setStorageValue(SAVED_CARDS_KEY, JSON.stringify(cards));
  }, [setStorageValue]);

  /**
   * Добавляет новую карту в список сохраненных
   * @param cardNumber - номер карты для добавления
   */
  const addCard = useCallback((cardNumber: string) => {
    if (!cardNumber || cardNumber.length < 16) {
      console.error('Attempt to add invalid card:', cardNumber);
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
          newCards.splice(MAX_SAVED_CARDS);
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