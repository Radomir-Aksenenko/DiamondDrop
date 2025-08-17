'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { CaseItem } from '@/hooks/useCasesAPI';
import Modal from './Modal';
import { DeliveryOrderCard, DeliveryOrder, DeliveryStatus } from './DeliveryOrderCard';
import ItemDescriptionModal from './ItemDescriptionModal';
import { useOrdersAPI, formatCoordinates } from '@/hooks/useOrdersAPI';
import { usePluralize } from '@/hooks/usePluralize';
import DeliveryLoader, { DeliveryCircleLoader } from './DeliveryLoader';
import type { Order } from '@/hooks/useOrdersAPI';

export default function DeliveryTab(): React.JSX.Element {
  // Хук для работы с API заказов
  const { orders, loading, hasMore, loadInitial, loadMore, isInitialized } = useOrdersAPI();
  const observerRef = useRef<HTMLDivElement>(null);
  
  // Состояние для модальных окон
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [selectedBranch, setSelectedBranch] = useState<{name: string; coordinates: string; cell: string} | null>(null);
  
  // Состояние для модального окна описания предмета
  const [isItemDescriptionModalOpen, setIsItemDescriptionModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CaseItem | null>(null);
  
  // Хук для склонения слов
  const { pluralizeItems } = usePluralize();

  // Универсальная функция маппинга API-статусов в UI-статусы
  const mapApiStatusToDeliveryStatus = useCallback((status: Order['status']): DeliveryStatus => {
    switch (status) {
      case 'Unknown':
        return DeliveryStatus.UNKNOWN;
      case 'Created':
        return DeliveryStatus.CREATED;
      case 'Accepted':
        return DeliveryStatus.ACCEPTED;
      case 'InDelivery':
        return DeliveryStatus.IN_DELIVERY;
      case 'Delivered':
        return DeliveryStatus.DELIVERED;
      case 'Confirmed':
        return DeliveryStatus.CONFIRMED;
      case 'Cancelled':
        return DeliveryStatus.CANCELLED;
      default:
        return DeliveryStatus.UNKNOWN;
    }
  }, []);

  // Конфигурация группировки и сортировки по блокам (легко изменяемая)
  type BlockKey = 'active' | 'history';
  const deliveryBlockConfig: Record<BlockKey, {
    statuses: DeliveryStatus[]; // какие статусы включать в блок
    priority: Partial<Record<DeliveryStatus, number>>; // приоритет сортировки по статусам (меньше = выше)
    secondarySort?: 'createdAtDesc' | 'createdAtAsc'; // вторичная сортировка внутри одного статуса
  }> = {
    active: {
      // Можно легко переставлять порядок статусов для активного блока
      statuses: [
        DeliveryStatus.IN_DELIVERY,
        DeliveryStatus.ACCEPTED,
        DeliveryStatus.DELIVERED,
        DeliveryStatus.CREATED,
      ],
      priority: {
        [DeliveryStatus.DELIVERED]: 0,
        [DeliveryStatus.IN_DELIVERY]: 1,
        [DeliveryStatus.ACCEPTED]: 2,
        [DeliveryStatus.CREATED]: 3,
      },
      secondarySort: 'createdAtDesc',
    },
    history: {
      statuses: [
        DeliveryStatus.CONFIRMED,
        DeliveryStatus.CANCELLED,
        DeliveryStatus.UNKNOWN,
      ],
      priority: {
        [DeliveryStatus.CONFIRMED]: 0,
        [DeliveryStatus.CANCELLED]: 1,
        [DeliveryStatus.UNKNOWN]: 2,

      },
      secondarySort: 'createdAtDesc',
    },
  };
  
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

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    if (!isInitialized) {
      loadInitial();
    }
  }, [isInitialized, loadInitial]);

  // Настройка Intersection Observer для бесконечной прокрутки
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = observerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasMore, loading, loadMore]);

  // Функция для преобразования данных API в формат DeliveryOrder
  const convertToDeliveryOrder = useCallback((order: Order): DeliveryOrder => {
    const mappedStatus = mapApiStatusToDeliveryStatus(order.status);
    return {
      id: order.id,
      status: mappedStatus,
      item: {
        id: order.item.item.id,
        name: order.item.item.name,
        description: order.item.item.description || '',
        rarity: order.item.item.rarity,
        price: order.item.item.price,
        amount: order.item.item.amount,
        imageUrl: order.item.item.imageUrl,
        percentChance: order.item.item.percentChance || 0,
        isWithdrawable: order.item.item.isWithdrawable || false
      } as CaseItem,
      amount: order.item.amount,
      branch: {
        name: order.branch.name,
        coordinates: formatCoordinates(order.branch.coordinates),
        cell: order.branch.cell.name
      },
      showConfirmButton: order.status === 'Delivered'
    };
  }, [mapApiStatusToDeliveryStatus]);

  // Универсальная функция группировки и сортировки заказов по указанному блоку
  const groupAndSortOrders = useCallback((srcOrders: Order[], block: BlockKey): DeliveryOrder[] => {
    const cfg = deliveryBlockConfig[block];
    const withStatus = srcOrders
      .map((o) => ({ api: o, status: mapApiStatusToDeliveryStatus(o.status) }))
      .filter(({ status }) => cfg.statuses.includes(status));

    withStatus.sort((a, b) => {
      const pa = cfg.priority[a.status] ?? 999;
      const pb = cfg.priority[b.status] ?? 999;
      if (pa !== pb) return pa - pb;
      // Вторичная сортировка по дате создания
      if (cfg.secondarySort === 'createdAtAsc') {
        return new Date(a.api.createdAt).getTime() - new Date(b.api.createdAt).getTime();
      }
      // По умолчанию убывание (сначала новые)
      return new Date(b.api.createdAt).getTime() - new Date(a.api.createdAt).getTime();
    });

    return withStatus.map(({ api }) => convertToDeliveryOrder(api));
  }, [convertToDeliveryOrder, deliveryBlockConfig, mapApiStatusToDeliveryStatus]);

  // Получаем заказы для каждого блока с учетом конфигурации
  const currentOrders = groupAndSortOrders(orders, 'active');
  const historyOrders = groupAndSortOrders(orders, 'history');

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
            <p className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-base font-bold leading-normal opacity-30'>{currentOrdersCount} {pluralizeItems(currentOrdersCount)}</p>
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
            {loading && currentOrders.length === 0 ? (
              <DeliveryLoader count={3} />
            ) : (
              currentOrders.map((order) => (
                <DeliveryOrderCard 
                    key={order.id}
                    order={order}
                    onConfirmDelivery={handleConfirmDelivery}
                    onBranchClick={handleBranchClick}
                    onItemClick={handleOpenItemDescriptionModal}
                  />
              ))
            )}
            {loading && currentOrders.length > 0 && (
              <DeliveryCircleLoader />
            )}
          </div>
        </div>
        
        {/* Колонка истории заказов */}
        <div className='flex flex-col items-start gap-3 flex-1 self-stretch rounded-xl bg-[rgba(249,248,252,0.05)]'>
          <div className='flex px-4 pb-3 pt-4 justify-between items-center self-stretch border-b border-[rgba(249,248,252,0.05)]'>
            <p className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-base font-bold leading-normal'>История заказов</p>
            <p className='text-[#F9F8FC] text-center font-["Actay_Wide"] text-base font-bold leading-normal opacity-30'>{historyOrdersCount} {pluralizeItems(historyOrdersCount)}</p>
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
            {loading && historyOrders.length === 0 ? (
              <DeliveryLoader count={3} />
            ) : (
              historyOrders.map((order) => (
                <DeliveryOrderCard 
                    key={order.id}
                    order={order}
                    onConfirmDelivery={handleConfirmDelivery}
                    onBranchClick={handleBranchClick}
                    onItemClick={handleOpenItemDescriptionModal}
                  />
              ))
            )}
            {loading && historyOrders.length > 0 && (
              <DeliveryCircleLoader />
            )}
            {/* Элемент для Intersection Observer */}
            <div ref={observerRef} className="h-4" />
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