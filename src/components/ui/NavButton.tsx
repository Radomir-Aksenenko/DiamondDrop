'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Импортируем SVG-иконки как React-компоненты
import AboutIcon from '../icons/AboutIcon';
import CaseIcon from '../icons/CaseIcon';
import UpdateIcon from '../icons/UpdateIcon';

interface NavButtonProps {
  icon: 'About' | 'Case' | 'Update' ; // Название иконки
  href?: string; // Путь для навигации (опциональный)
  label?: string; // Опциональная подпись (если нужна)
  onClick?: () => void; // Опциональный обработчик клика
}

/**
 * Компонент кнопки навигации для хедера
 * @param icon - Название иконки ('About', 'Case', 'Update')
 * @param href - Путь для навигации (опциональный)
 * @param label - Опциональная подпись
 * @param onClick - Опциональный обработчик клика
 */
export default function NavButton({ icon, href, label, onClick }: NavButtonProps) {
  const pathname = usePathname();
  const isActive = href ? pathname === href : false;
  
  // Функция для выбора нужного SVG-компонента
  const getIconComponent = () => {
    switch (icon) {
      case 'About':
        return <AboutIcon className="w-[14px] h-[12px]" />;
      case 'Case':
        return <CaseIcon className="w-[14px] h-[12px]" />;
      case 'Update':
        return <UpdateIcon className="w-[14px] h-[12px]" />;
      default:
        return null;
    }
  };
  
  // Варианты анимации для контейнера иконки
  const iconContainerVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.1, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
    active: isActive ? {
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    } : {}
  };

  // Варианты анимации для иконки
  const iconVariants = {
    initial: { rotate: 0 },
    hover: { rotate: isActive ? 0 : 5, transition: { duration: 0.3 } },
    tap: { rotate: isActive ? 0 : 2 },
    active: isActive ? {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    } : {}
  };

  // Варианты анимации для текста
  const textVariants = {
    initial: { opacity: isActive ? 1 : 0.7 },
    hover: { opacity: 1, transition: { duration: 0.2 } },
    tap: { opacity: 1 },
    active: isActive ? {
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    } : {}
  };

  // Варианты анимации для фона кнопки
  const buttonBgVariants = {
    initial: { backgroundColor: 'rgba(25, 25, 29, 0)' },
    hover: { backgroundColor: 'rgba(25, 25, 29, 1)', transition: { duration: 0.2 } },
    tap: { backgroundColor: 'rgba(25, 25, 29, 1)' },
    active: { backgroundColor: 'rgba(25, 25, 29, 1)' }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const content = (
    <motion.div
      initial="initial"
      animate={isActive ? "active" : "initial"}
      whileHover="hover"
      whileTap="tap"
      variants={buttonBgVariants}
      className={isActive ? 'inline-flex items-center gap-2 p-2 rounded-full text-[#F9F8FC]' : 'inline-flex items-center gap-2 p-2 rounded-full text-[#F9F8FC]/70 hover:text-[#F9F8FC]'}
      layout
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <motion.div 
          className={isActive ? 'flex flex-col justify-center items-center w-[30px] h-[30px] gap-[10px] aspect-square rounded-[42px] bg-[#5C5ADC]' : 'flex flex-col justify-center items-center w-[30px] h-[30px] gap-[10px] aspect-square rounded-[42px] bg-[#F9F8FC]/5'}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <motion.div 
            className={isActive ? 'text-[#F9F8FC]' : 'text-[#89898D]'}
          >
            {getIconComponent()}
          </motion.div>
        </motion.div>
      
      {label && (
        <motion.span 
          className={isActive ? 'flex items-center text-base font-bold pr-1 text-[#F9F8FC]' : 'flex items-center text-base font-bold pr-1 text-[#838286]'}
          layout
        >
          {label}
        </motion.span>
      )}
    </motion.div>
  );

  if (onClick) {
    return (
      <div onClick={handleClick} className="inline-block cursor-pointer">
        {content}
      </div>
    );
  }

  return (
    <Link href={href || '#'} className="inline-block cursor-pointer">
      {content}
    </Link>
  );
}