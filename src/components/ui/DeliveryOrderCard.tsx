'use client';

import React from 'react';
import { ItemCard } from './RarityCard';
import { CaseItem } from '@/hooks/useCasesAPI';

// Типы статусов доставки
export enum DeliveryStatus {
  UNKNOWN = 'unknown',
  CREATED = 'created',
  ACCEPTED = 'accepted',
  IN_DELIVERY = 'in_delivery',
  DELIVERED = 'delivered',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled'
}

// Функция для получения стилей статуса
function getStatusStyles(status: DeliveryStatus): { text: string; color: string; bgColor: string } {
  switch (status) {
    case DeliveryStatus.UNKNOWN:
      return {
        text: 'Ошибка. Свяжитесь с тех. поддержкой',
        color: 'text-[#E74A4A]',
        bgColor: 'bg-[rgba(231,74,74,0.10)]'
      };
    case DeliveryStatus.CREATED:
      return {
        text: 'Заказ создан',
        color: 'text-[#F9F8FC]/50',
        bgColor: 'bg-[rgba(249,248,252,0.05)]'
      };
    case DeliveryStatus.ACCEPTED:
      return {
        text: 'Заказ принят',
        color: 'text-[#5C5ADC]',
        bgColor: 'bg-[rgba(92,90,220,0.10)]'
      };
    case DeliveryStatus.IN_DELIVERY:
      return {
        text: 'Едет с курьером',
        color: 'text-[#5C5ADC]',
        bgColor: 'bg-[rgba(92,90,220,0.10)]'
      };
    case DeliveryStatus.DELIVERED:
      return {
        text: 'Доставлен в филиал',
        color: 'text-[#11AB47]',
        bgColor: 'bg-[rgba(17,171,71,0.10)]'
      };
    case DeliveryStatus.CONFIRMED:
      return {
        text: 'Получен',
        color: 'text-[#11AB47]',
        bgColor: 'bg-[rgba(17,171,71,0.10)]'
      };
    case DeliveryStatus.CANCELLED:
      return {
        text: 'Отменен',
        color: 'text-[#E74A4A]',
        bgColor: 'bg-[rgba(231,74,74,0.10)]'
      };
    default:
      return {
        text: 'Неизвестный статус',
        color: 'text-[#F9F8FC]',
        bgColor: 'bg-[rgba(249,248,252,0.05)]'
      };
  }
}

// Типы для данных заказа
export interface DeliveryOrder {
  id: string;
  status: DeliveryStatus;
  item: CaseItem;
  amount: number;
  branch: {
    name: string;
    coordinates: string;
    cell: string;
  };
  showConfirmButton: boolean;
}

// Пропсы компонента карточки заказа
export interface DeliveryOrderCardProps {
  order: DeliveryOrder;
  onConfirmDelivery: (orderId: string) => void;
  onBranchClick: (branchName: string) => void;
  onItemClick?: (item: CaseItem) => void;
}

// Компонент карточки заказа
export function DeliveryOrderCard({ order, onConfirmDelivery, onBranchClick, onItemClick }: DeliveryOrderCardProps) {
  const statusStyles = getStatusStyles(order.status);
  
  return (
    <div className='flex flex-col items-start pb-3 gap-3 self-stretch rounded-xl bg-[rgba(249,248,252,0.05)]'>
      <div className={`flex h-[36px] px-[12px] py-[8px] justify-center items-center gap-[10px] self-stretch rounded-t-[12px] ${statusStyles.bgColor}`}>
        <p className={`${statusStyles.color} font-["Actay_Wide"] text-base leading-normal text-ellipsis line-clamp-1`} style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 1 }}>
          {statusStyles.text}
        </p>
      </div>
      <div className='flex px-3 items-center gap-2 self-stretch'>
        <ItemCard 
          item={order.item}
          amount={order.amount}
          orientation="horizontal"
          onClick={onItemClick ? () => onItemClick(order.item) : undefined}
        />
        <div className='flex flex-col items-start gap-[3px] flex-[1_0_0]'>
          <div className='self-stretch'>
            <span className='text-[rgba(249,248,252,0.30)] font-["Actay_Wide"] text-base font-bold leading-normal'>Филиал: </span>
            <span 
              className='text-[rgba(249,248,252,0.50)] font-["Actay_Wide"] text-base font-bold leading-normal underline decoration-[rgba(241,241,241,0.50)] cursor-pointer hover:text-[rgba(249,248,252,0.70)] transition-colors'
              onClick={() => onBranchClick(order.branch.name)}
            >
              {order.branch.name}
            </span>
          </div>
          <div className='self-stretch'>
            <span className='text-[rgba(249,248,252,0.30)] font-["Actay_Wide"] text-base font-bold leading-normal'>Корды в аду: </span>
            <span className='text-[rgba(249,248,252,0.50)] font-["Actay_Wide"] text-base font-bold leading-normal'>{order.branch.coordinates}</span>
          </div>
          <div className='self-stretch'>
            <span className='text-[rgba(249,248,252,0.30)] font-["Actay_Wide"] text-base font-bold leading-normal'>Ячейка: </span>
            <span className={`font-["Actay_Wide"] text-base font-bold leading-normal ${
              order.branch.cell === 'Пока неизвестно' 
                ? 'text-[rgba(249,248,252,0.10)]' 
                : 'text-[rgba(249,248,252,0.50)]'
            }`}>
              {order.branch.cell}
            </span>
          </div>

        </div>
      </div>
      {order.showConfirmButton && (
        <div className='flex flex-col items-start px-3 gap-[10px] self-stretch'>
          <button 
            className='flex h-[36px] px-[12px] py-[8px] justify-center items-center gap-[10px] self-stretch rounded-[8px] bg-[#5C5ADC] hover:bg-[#4A48B8] transition-colors cursor-pointer'
            onClick={() => onConfirmDelivery(order.id)}
          >
            <p className='overflow-hidden text-[#F9F8FC] text-ellipsis font-["Actay_Wide"] text-base font-bold leading-normal' style={{ display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 1 }}>
              Подтвердить получение
            </p>
          </button>
        </div>
      )}
    </div>
  );
}

export default DeliveryOrderCard;