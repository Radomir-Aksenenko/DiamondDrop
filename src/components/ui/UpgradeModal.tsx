'use client';

import React from 'react';
import Modal from './Modal';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Модальное окно апгрейда с креативным сообщением о разработке
 * @param isOpen - Флаг открытия модального окна
 * @param onClose - Функция закрытия модального окна
 */
export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ошибка">
      <div className="flex flex-col gap-6 text-center">
        {/* Креативный текст */}
        <div className="space-y-4">
          <div className="bg-[#151519] p-4 rounded-lg">
            <p className="text-[#F9F8FC]/50 text-base">
              Мы усердно работаем над этой функцией, 
              попивая кофе и споря о том, какой цвет кнопки лучше. 
              Скоро здесь будет что-то невероятное!
            </p>
          </div>
        </div>
        
        {/* Кнопки действий */}
        <div className="grid grid-cols-2 gap-3 mt-4">
          <button 
            onClick={onClose}
            className="bg-[#19191D] hover:bg-[#1E1E23] transition-colors py-2.5 px-4 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0"
          >
            Закрыть
          </button>
          <button 
            onClick={onClose}
            className="bg-[#5C5ADC] hover:bg-[#4A48B0] transition-colors py-2.5 px-4 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0"
          >
            Учту
          </button>
        </div>
      </div>
    </Modal>
  );
}