'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useIsMobile } from '@/hooks/useIsMobile';

// Импортируем SVG-иконки как React-компоненты
import CaseIcon from '../icons/CaseIcon';
import UpdateIcon from '../icons/UpdateIcon';
// import AboutIcon from '../icons/AboutIcon';
// import TestNotificationModal from './TestNotificationModal';

interface BottomNavigationProps {
  onUpgradeClick?: () => void;
  onProfileClick?: () => void;
}

export default function BottomNavigation({ onUpgradeClick, onProfileClick }: BottomNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isMobile } = useIsMobile();
  // const [isTestOpen, setIsTestOpen] = useState(false);
  // const openTest = useCallback(() => setIsTestOpen(true), []);
  // const closeTest = useCallback(() => setIsTestOpen(false), []);

  // Показываем только на мобильных устройствах
  if (!isMobile) {
    return null;
  }

  const handleUpgradeClick = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      router.push('/upgrade');
    }
  };

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      router.push('/profile');
    }
  };

  const createClickHandler = (handler: () => void) => {
    const handleEvent = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
      e.stopPropagation();
      e.preventDefault();
    };

    const handleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      handler();
    };

    return {
      onPointerDown: handleEvent,
      onMouseDown: handleEvent,
      onTouchStart: handleEvent,
      onClick: handleClick,
    };
  };

  const navItems = [
    {
      id: 'cases',
      icon: <CaseIcon />,
      label: 'Кейсы',
      href: '/',
      isActive: pathname === '/'
    },
    {
      id: 'upgrade',
      icon: <UpdateIcon />,
      label: 'Апгрейд',
      onClick: handleUpgradeClick,
      isActive: pathname === '/upgrade'
    },
    {
      id: 'profile',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
          <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="currentColor"/>
        </svg>
      ),
      label: 'Профиль',
      onClick: handleProfileClick,
      isActive: pathname === '/profile'
    }
  ];

  const handleContainerInteraction = (e: React.MouseEvent | React.TouchEvent | React.PointerEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <>
      <div
        className="fixed bottom-4 left-4 right-4 z-[9999] bg-[#151519]/90 backdrop-blur-md rounded-2xl shadow-lg shadow-black/40 border border-[#F9F8FC]/10 pointer-events-auto touch-action-manipulation select-none"
        onPointerDown={handleContainerInteraction}
        onMouseDown={handleContainerInteraction}
        onTouchStart={handleContainerInteraction}
        onClick={handleContainerInteraction}
      >
        <div className="flex items-center justify-around px-3 py-1.5 safe-area-pb">
          {navItems.map((item) => {
          const content = (
            <div className="flex flex-col items-center gap-0.5 py-1.5 px-2 min-w-0">
              <div
                className={`flex items-center justify-center w-5 h-5 transition-colors duration-300 ${
                  item.isActive ? 'text-[#5C5ADC]' : 'text-[#89898D]'
                }`}
              >
                {item.icon}
              </div>
              <span
                className={`text-xs font-medium transition-colors duration-300 truncate ${
                  item.isActive ? 'text-[#F9F8FC]' : 'text-[#838286]'
                }`}
              >
                {item.label}
              </span>
            </div>
          );

          if (item.onClick) {
            return (
              <button
                key={item.id}
                {...createClickHandler(item.onClick)}
                className="flex-1 flex justify-center items-center cursor-pointer transition-all duration-300 hover:bg-[#F9F8FC]/5 rounded-xl touch-action-manipulation active:scale-95"
              >
                {content}
              </button>
            );
          }

          return (
            <button
              key={item.id}
              {...createClickHandler(() => router.push(item.href!))}
              className="flex-1 flex justify-center items-center cursor-pointer transition-all duration-300 hover:bg-[#F9F8FC]/5 rounded-xl touch-action-manipulation active:scale-95"
            >
              {content}
            </button>
          );
          })}
        </div>
      </div>
      {/* Тестовый пункт меню удалён */}
    </>
  );
}
