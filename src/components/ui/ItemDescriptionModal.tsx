'use client';

import React from 'react';
import Modal from './Modal';
import { motion } from 'framer-motion';

interface ItemDescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Модальное окно описания предмета
 */
export default function ItemDescriptionModal({ isOpen, onClose }: ItemDescriptionModalProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Описание"
      className="w-[450px] h-[388px]"
    >
      <motion.div 
        className="flex flex-col gap-4 h-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        {/* Основной контент модалки - пустой как просили */}
        <div className="flex-1 flex items-center justify-center" style={{ minHeight: '250px' }}>
          <p className="text-[#F9F8FC]/50 font-unbounded text-sm text-center">
            Содержимое будет добавлено позже
          </p>
        </div>
        
        {/* Кнопки внизу */}
        <div className="flex gap-3 mt-auto pt-4">
          {/* Кнопка закрыть */}
          <motion.button
            className="flex-1 px-4 py-3 bg-[#19191D] text-[#F9F8FC] font-unbounded text-sm font-medium rounded-lg hover:bg-[#1E1E23] transition-colors"
            onClick={onClose}
            whileHover={{ backgroundColor: "#1E1E23" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            Закрыть
          </motion.button>
          
          {/* Кнопка учту */}
          <motion.button
            className="flex-1 px-4 py-3 bg-[#5C5ADC] text-[#F9F8FC] font-unbounded text-sm font-medium rounded-lg hover:bg-[#6462DE] transition-colors"
            onClick={onClose}
            whileHover={{ backgroundColor: "#6462DE" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            Учту
          </motion.button>
        </div>
      </motion.div>
    </Modal>
  );
}