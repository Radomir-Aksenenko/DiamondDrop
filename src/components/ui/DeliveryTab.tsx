'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { CaseItem } from '@/hooks/useCasesAPI';
import Modal from './Modal';
import { DeliveryOrderCard, DeliveryOrder, DeliveryStatus } from './DeliveryOrderCard';
import ItemDescriptionModal from './ItemDescriptionModal';

export default function DeliveryTab(): React.JSX.Element {
  // Состояние для модальных окон
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<{name: string; coordinates: string; cell: string} | null>(null);
  
  // Состояние для модального окна описания предмета
  const [isItemDescriptionModalOpen, setIsItemDescriptionModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CaseItem | null>(null);
  
  // Функции для управления модальным окном описания предмета
  const handleOpenItemDescriptionModal = useCallback((item: CaseItem) => {
    setSelectedItem(item);
    setIsItemDescriptionModalOpen(true);
  }, []);

  const handleCloseItemDescriptionModal = useCallback(() => {
    setIsItemDescriptionModalOpen(false);
    // Не сбрасываем selectedItem в null сразу, чтобы анимация закрытия работала корректно
  }, []);

  // Сбрасываем selectedItem с задержкой после закрытия модального окна
  useEffect(() => {
    if (!isItemDescriptionModalOpen && selectedItem) {
      const timer = setTimeout(() => {
        setSelectedItem(null);
      }, 300); // Задержка соответствует времени анимации закрытия
      return () => clearTimeout(timer);
    }
  }, [isItemDescriptionModalOpen, selectedItem]);

  // Данные текущих заказов
  const currentOrders: DeliveryOrder[] = [
    {
      id: '1',
      status: DeliveryStatus.DELIVERED,
      item: {
        id: '1',
        name: 'AK-47 | Redline',
        description: 'Автомат Калашникова с красными полосами',
        rarity: 'Legendary',
        price: 150.5,
        amount: 1,
        imageUrl: '',
        percentChance: 2.5,
        isWithdrawable: true
      } as CaseItem,
      amount: 1,
      branch: {
        name: '«Торговый центр Омега»',
        coordinates: 'зв 90',
        cell: 'A3'
      },
      showConfirmButton: false
    },
    {
      id: '2',
      status: DeliveryStatus.IN_TRANSIT,
      item: {
        id: '2',
        name: 'AWP | Dragon Lore',
        description: 'Легендарная снайперская винтовка с уникальным дизайном',
        rarity: 'Legendary',
        price: 2500.0,
        amount: 1,
        imageUrl: '',
        percentChance: 0.5,
        isWithdrawable: true
      } as CaseItem,
      amount: 1,
      branch: {
        name: '«Пункт выдачи Гамма»',
        coordinates: 'кв 45',
        cell: 'Пока неизвестно'
      },
      showConfirmButton: true
    }
  ];

  // Данные истории заказов (только доставленные)
  const historyOrders: DeliveryOrder[] = [
    {
      id: '4',
      status: DeliveryStatus.DONE,
      item: {
        id: '4',
        name: 'M4A4 | Howl',
        description: 'Редкая штурмовая винтовка с запрещенным дизайном',
        rarity: 'Legendary',
        price: 3200.0,
        amount: 1,
        imageUrl: '',
        percentChance: 0.1,
        isWithdrawable: true
      } as CaseItem,
      amount: 1,
      branch: {
        name: '«Склад Дельта»',
        coordinates: 'св 75',
        cell: 'D1'
      },
      showConfirmButton: true
    },
    {
      id: '5',
      status: DeliveryStatus.DONE,
      item: {
        id: '5',
        name: 'Glock-18 | Fade',
        description: 'Пистолет с градиентной окраской',
        rarity: 'Epic',
        price: 180.0,
        amount: 1,
        imageUrl: '',
        percentChance: 5.2,
        isWithdrawable: true
      } as CaseItem,
      amount: 1,
      branch: {
        name: '«Центр Альфа»',
        coordinates: 'жв 128',
        cell: 'B7'
      },
      showConfirmButton: false
    },
    {
      id: '6',
      status: DeliveryStatus.DONE,
      item: {
        id: '6',
        name: 'Karambit | Tiger Tooth',
        description: 'Нож-керамбит с тигровым узором',
        rarity: 'Legendary',
        price: 1850.0,
        amount: 1,
        imageUrl: '',
        percentChance: 0.8,
        isWithdrawable: true
      } as CaseItem,
      amount: 1,
      branch: {
        name: '«Терминал Бета»',
        coordinates: 'кв 200',
        cell: 'E5'
      },
      showConfirmButton: false
    }
  ];

  // Подсчёт общего количества предметов
  const currentOrdersCount = currentOrders.reduce((total, order) => total + order.amount, 0);
  const historyOrdersCount = historyOrders.reduce((total, order) => total + order.amount, 0);

  // Обработчики событий
  const handleConfirmDelivery = (orderId: string) => {
    setSelectedOrderId(orderId);
    setIsConfirmModalOpen(true);
  };

  const handleBranchClick = (branchName: string) => {
    // Найти полную информацию о филиале по названию
    const allOrders = [...currentOrders, ...historyOrders];
    const foundOrder = allOrders.find(order => order.branch.name === branchName);
    if (foundOrder) {
      setSelectedBranch(foundOrder.branch);
      setIsBranchModalOpen(true);
    }
  };

  const handleCloseConfirmModal = () => {
    setIsConfirmModalOpen(false);
    setSelectedOrderId('');
  };

  const handleCloseBranchModal = () => {
    setIsBranchModalOpen(false);
    setSelectedBranch(null);
  };

  return (
    <>
      <div className='flex items-start gap-[8px] flex-[1_0_0] self-stretch mb-8'>
        {/* Колонка текущих заказов */}
        <div className='flex flex-col items-start gap-3 flex-1 self-stretch rounded-xl bg-[rgba(249,248,252,0.05)]'>
          <div className='flex px-4 pb-3 pt-4 justify-between items-center self-stretch border-b border-[rgba(249,248,252,0.05)]'>
            <p className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-base font-bold leading-normal'>Текущие заказы</p>
            <p className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-base font-bold leading-normal opacity-30'>{currentOrdersCount} {currentOrdersCount === 1 ? 'предмет' : currentOrdersCount >= 2 && currentOrdersCount <= 4 ? 'предмета' : 'предметов'}</p>
          </div>
          <div 
            className={`flex flex-col items-start px-3 gap-2 flex-[1_0_0] self-stretch ${
              currentOrders.length > 2 ? 'overflow-y-auto pr-2' : ''
            }`}
            style={currentOrders.length > 2 ? {
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(249, 248, 252, 0.2) transparent'
            } : {}}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                width: 4px;
              }
              div::-webkit-scrollbar-track {
                background: transparent;
              }
              div::-webkit-scrollbar-thumb {
                background: rgba(249, 248, 252, 0.2);
                border-radius: 2px;
              }
              div::-webkit-scrollbar-thumb:hover {
                background: rgba(249, 248, 252, 0.3);
              }
            `}</style>
            {currentOrders.map((order) => (
              <DeliveryOrderCard 
                  key={order.id}
                  order={order}
                  onConfirmDelivery={handleConfirmDelivery}
                  onBranchClick={handleBranchClick}
                  onItemClick={handleOpenItemDescriptionModal}
                />
            ))}
          </div>
        </div>
        
        {/* Колонка истории заказов */}
        <div className='flex flex-col items-start gap-3 flex-1 self-stretch rounded-xl bg-[rgba(249,248,252,0.05)]'>
          <div className='flex px-4 pb-3 pt-4 justify-between items-center self-stretch border-b border-[rgba(249,248,252,0.05)]'>
            <p className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-base font-bold leading-normal'>История заказов</p>
            <p className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-base font-bold leading-normal opacity-30'>{historyOrdersCount} {historyOrdersCount === 1 ? 'предмет' : historyOrdersCount >= 2 && historyOrdersCount <= 4 ? 'предмета' : 'предметов'}</p>
          </div>
          <div 
            className={`flex flex-col items-start px-3 gap-2 flex-[1_0_0] self-stretch ${
              historyOrders.length > 2 ? 'overflow-y-auto pr-2' : ''
            }`}
            style={historyOrders.length > 2 ? {
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(249, 248, 252, 0.2) transparent'
            } : {}}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                width: 4px;
              }
              div::-webkit-scrollbar-track {
                background: transparent;
              }
              div::-webkit-scrollbar-thumb {
                background: rgba(249, 248, 252, 0.2);
                border-radius: 2px;
              }
              div::-webkit-scrollbar-thumb:hover {
                background: rgba(249, 248, 252, 0.3);
              }
            `}</style>
            {historyOrders.map((order) => (
              <DeliveryOrderCard 
                  key={order.id}
                  order={order}
                  onConfirmDelivery={handleConfirmDelivery}
                  onBranchClick={handleBranchClick}
                  onItemClick={handleOpenItemDescriptionModal}
                />
            ))}
          </div>
        </div>
      </div>

      {/* Модальное окно подтверждения получения */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={handleCloseConfirmModal}
        title="Подтверждение"
      >
        <div className='flex flex-col gap-4 p-4'>
          <p className='text-[#F9F8FC]/50 text-lg'>
            Вы уверены, что хотите подтвердить получение заказа?
          </p>
          <div className='grid grid-cols-2 gap-2'>
            <button 
              onClick={handleCloseConfirmModal}
              className='bg-[#19191D] hover:bg-[#1E1E23] transition-colors py-2.5 px-4 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0'
              type="button"
            >
              Отменить
            </button>
            <button 
              onClick={() => {
                // Здесь будет логика подтверждения
                console.log('Подтверждение получения заказа:', selectedOrderId);
                handleCloseConfirmModal();
              }}
              className='bg-[#5C5ADC] hover:bg-[#4A48B0] transition-colors py-2.5 px-4 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0'
              type="button"
            >
              Подтвердить
            </button>
          </div>
        </div>
      </Modal>

      {/* Модальное окно информации о филиале */}
      <Modal
        isOpen={isBranchModalOpen}
        onClose={handleCloseBranchModal}
        title="О филиале"
      >
        <div className='flex flex-col gap-4 p-4'>
          {selectedBranch && (
            <div className=''>
              <div>
                <span className='text-[#F9F8FC]/30 font-["Actay_Wide"] text-xl font-bold'>Имя: </span>
                <span className='text-[#F9F8FC] font-["Actay_Wide"] text-xl font-bold leading-normal'>{selectedBranch.name}</span>
              </div>
              <div>
                <span className='text-[#F9F8FC]/30 font-["Actay_Wide"] text-xl font-bold'>Корды: </span>
                {selectedBranch.coordinates.split(' ')[0].toLowerCase().startsWith('зв') && (
                  <span className='text-[#289547] text-base font-[515] leading-normal tabular-nums lining-nums'>{selectedBranch.coordinates}</span>
                )}
                {selectedBranch.coordinates.split(' ')[0].toLowerCase().startsWith('жв') && (
                  <span className='text-[#D9C332] text-base font-[515] leading-normal tabular-nums lining-nums'>{selectedBranch.coordinates}</span>
                )}
                {selectedBranch.coordinates.split(' ')[0].toLowerCase().startsWith('кв') && (
                  <span className='text-[#E74A4A] text-base font-[515] leading-normal tabular-nums lining-nums'>{selectedBranch.coordinates}</span>
                )}
                {selectedBranch.coordinates.split(' ')[0].toLowerCase().startsWith('св') && (
                  <span className='text-[#668CE0] text-base font-[515] leading-normal tabular-nums lining-nums'>{selectedBranch.coordinates}</span>
                )}
              </div>

            </div>
          )}
          
          <div className='flex h-[260px] flex-col items-start gap-1 self-stretch'>
            <img 
              src="/assets.png" 
              alt="Branch location"
              className="flex-1 self-stretch rounded-md"
            />
            <div className='flex items-start gap-[4px] flex-[1_0_0] self-stretch'>
              <img 
                src="/assets2.png" 
                alt="Branch location"
                className="flex-1 self-stretch rounded-md"
              />
              <img 
                src="/assets2.png" 
                alt="Branch location"
                className="flex-1 self-stretch rounded-md"
              />
            </div>
          </div>
          
          <div className='grid grid-cols-2 gap-2'>
            <button 
              onClick={handleCloseBranchModal}
              className='bg-[#19191D] hover:bg-[#1E1E23] transition-colors py-2.5 px-4 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0'
              type="button"
            >
              Закрыть
            </button>
            <button 
              onClick={handleCloseBranchModal}
              className='bg-[#5C5ADC] hover:bg-[#4A48B0] transition-colors py-2.5 px-4 rounded-lg text-[#F9F8FC] font-bold cursor-pointer outline-none focus:outline-none active:outline-none focus:ring-0 active:ring-0'
              type="button"
            >
              Учту
            </button>
          </div>
        </div>
      </Modal>
      
      {/* Модальное окно описания предмета */}
      <ItemDescriptionModal
        isOpen={isItemDescriptionModalOpen}
        onClose={handleCloseItemDescriptionModal}
        item={selectedItem}
      />
    </>
  );
}