'use client';

import React, { useEffect, useRef, useCallback, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  className?: string;
  hideCloseButton?: boolean;
}

// Оптимизированные варианты анимации для лучшей производительности
const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: {
      duration: 0.2
    }
  },
  exit: { 
    opacity: 0,
    transition: {
      duration: 0.15
    }
  }
};

const modalVariants = {
  hidden: { 
    scale: 0.9, 
    opacity: 0,
    y: 20
  },
  visible: { 
    scale: 1, 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      delay: 0.05
    }
  },
  exit: { 
    scale: 0.9, 
    opacity: 0,
    y: 20,
    transition: {
      duration: 0.2
    }
  }
};



/**
 * Оптимизированный компонент модального окна
 * @param isOpen - Флаг открытия модального окна
 * @param onClose - Функция закрытия модального окна
 * @param children - Содержимое модального окна
 * @param title - Заголовок модального окна (опционально)
 */
const Modal = memo(function Modal({ isOpen, onClose, children, title, className, hideCloseButton }: ModalProps) {
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
    <AnimatePresence mode="sync">
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
          
          {/* Оптимизированное модальное окно - адаптивное */}
          <motion.div
            className={`relative z-10 bg-[#151519] rounded-[12px] md:rounded-[16px] shadow-xl overflow-hidden mx-3 md:mx-4 ${className ? className : 'w-full max-w-md max-h-[90vh]'}`}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ willChange: 'transform, opacity' }}
          >
            {/* Заголовок - адаптивный */}
            {title && (
              <div className="px-3 md:px-4 pt-3 md:pt-4 pb-2">
                <h2 className="text-lg md:text-xl font-bold text-[#F9F8FC] font-unbounded">{title}</h2>
              </div>
            )}

            {/* Кнопка закрытия - адаптивная */}
            {!hideCloseButton && (
              <button
                className="absolute top-2 md:top-3 right-2 md:right-3 flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full bg-[#19191D] text-[#F9F8FC] hover:bg-[#1E1E23] transition-colors cursor-pointer"
                onClick={onClose}
                aria-label="Закрыть"
                type="button"
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="md:w-4 md:h-4">
                  <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}

            {/* Содержимое - адаптивные отступы */}
            <div className="px-3 md:px-4 pb-3 md:pb-4 overflow-y-auto max-h-[calc(90vh-80px)]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
});

export default Modal;