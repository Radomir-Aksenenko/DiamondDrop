'use client';

import React, { useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  className?: string;
}

// Оптимизированные варианты анимации для лучшей производительности
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const modalVariants = {
  hidden: { 
    scale: 0.95, 
    opacity: 0,
    y: 10
  },
  visible: { 
    scale: 1, 
    opacity: 1,
    y: 0
  },
  exit: { 
    scale: 0.95, 
    opacity: 0,
    y: 10
  }
};



/**
 * Оптимизированный компонент модального окна
 * @param isOpen - Флаг открытия модального окна
 * @param onClose - Функция закрытия модального окна
 * @param children - Содержимое модального окна
 * @param title - Заголовок модального окна (опционально)
 */
const Modal = memo(function Modal({ isOpen, onClose, children, title, className }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Мемоизированный обработчик клика по оверлею
  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  }, [onClose]);

  // Мемоизированный обработчик клавиши Escape
  const handleEscapeKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      onClose();
    }
  }, [isOpen, onClose]);

  // Закрытие модального окна при нажатии Escape
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
      };
    }
    return () => {};
  }, [isOpen, handleEscapeKey]);

  // Комментарий: Убрана блокировка скролла при открытом модальном окне
  // Теперь скролл бар не будет скрываться при открытии модального окна

  return (
    <AnimatePresence mode="sync" initial={false}>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Оптимизированный оверлей */}
          <motion.div
            ref={overlayRef}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={handleOverlayClick}
            style={{ willChange: 'opacity' }}
          />
          
          {/* Оптимизированное модальное окно */}
          <motion.div
            className={`relative z-10 w-full bg-[#151519] rounded-[16px] shadow-xl overflow-hidden ${className || 'max-w-md'}`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ willChange: 'transform, opacity' }}
          >
            {/* Заголовок */}
            {title && (
              <div className="px-4 pt-4 pb-2">
                <h2 className="text-xl font-bold text-[#F9F8FC] font-unbounded">{title}</h2>
              </div>
            )}
            
            {/* Кнопка закрытия */}
            <button
              className="absolute top-3 right-3 flex items-center justify-center w-8 h-8 rounded-full bg-[#19191D] text-[#F9F8FC] hover:bg-[#1E1E23] transition-colors cursor-pointer"
              onClick={onClose}
              aria-label="Закрыть"
              type="button"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            
            {/* Содержимое */}
            <div className="px-4 pb-4">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

export default Modal;