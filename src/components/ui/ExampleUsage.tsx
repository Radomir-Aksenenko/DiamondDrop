'use client';

import React from 'react';
import { ItemCard } from './RarityCard';
import { CaseItem } from '@/hooks/useCasesAPI';

/**
 * Компонент для демонстрации использования ItemCard
 * Показывает различные примеры отображения предметов в горизонтальном формате
 */
export default function ExampleUsage() {
  // Примеры данных предметов с разными редкостями
  const exampleItems: CaseItem[] = [
    {
      id: '1',
      name: 'Обычный предмет',
      description: 'Простой предмет обычной редкости',
      imageUrl: '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png',
      amount: 2, // X2 - количество единиц в одном предмете из API
      price: 12, // АР - оценка предмета
      percentChance: 45.5,
      rarity: 'Common',
      isWithdrawable: true
    },
    {
      id: '2', 
      name: 'Редкий предмет',
      description: 'Предмет редкой категории',
      imageUrl: '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png',
      amount: 5, // X5 - количество единиц в одном предмете из API
      price: 25.5, // АР - оценка предмета
      percentChance: 15.2,
      rarity: 'Rare',
      isWithdrawable: true
    },
    {
      id: '3',
      name: 'Эпический предмет', 
      description: 'Очень редкий эпический предмет',
      imageUrl: '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png',
      amount: 10, // X10 - количество единиц в одном предмете из API
      price: 150, // АР - оценка предмета
      percentChance: 5.1,
      rarity: 'Epic',
      isWithdrawable: false
    },
    {
      id: '4',
      name: 'Легендарный предмет',
      description: 'Самый редкий легендарный предмет',
      imageUrl: '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png',
      amount: 1, // X1 - количество единиц в одном предмете из API
      price: 500, // АР - оценка предмета
      percentChance: 0.5,
      rarity: 'Legendary',
      isWithdrawable: true
    }
  ];

  // Обработчик клика по предмету
  const handleItemClick = (item: CaseItem, amount: number) => {
    console.log(`Клик по предмету: ${item.name}, количество штук: ${amount}`);
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-white text-xl font-bold mb-4">
        Примеры использования ItemCard
      </h2>
      
      <div className="space-y-3">
        {/* Пример 1: Обычный предмет - выпадает 1 штука */}
        <div>
          <h3 className="text-white text-sm mb-2 opacity-70">
            Обычный предмет (1 штука)
          </h3>
          <ItemCard 
            item={exampleItems[0]}
            amount={1} // ШТ - сколько выпадает за раз этих предметов
            orientation="horizontal"
            onClick={() => handleItemClick(exampleItems[0], 1)}
          />
        </div>

        {/* Пример 2: Редкий предмет - выпадает 3 штуки */}
        <div>
          <h3 className="text-white text-sm mb-2 opacity-70">
            Редкий предмет (3 штуки)
          </h3>
          <ItemCard 
            item={exampleItems[1]}
            amount={3} // ШТ - сколько выпадает за раз этих предметов
            orientation="horizontal"
            onClick={() => handleItemClick(exampleItems[1], 3)}
          />
        </div>

        {/* Пример 3: Эпический предмет - выпадает 2 штуки */}
        <div>
          <h3 className="text-white text-sm mb-2 opacity-70">
            Эпический предмет (2 штуки)
          </h3>
          <ItemCard 
            item={exampleItems[2]}
            amount={2} // ШТ - сколько выпадает за раз этих предметов
            orientation="horizontal"
            onClick={() => handleItemClick(exampleItems[2], 2)}
          />
        </div>

        {/* Пример 4: Легендарный предмет - выпадает 1 штука */}
        <div>
          <h3 className="text-white text-sm mb-2 opacity-70">
            Легендарный предмет (1 штука)
          </h3>
          <ItemCard 
            item={exampleItems[3]}
            amount={1} // ШТ - сколько выпадает за раз этих предметов
            orientation="horizontal"
            onClick={() => handleItemClick(exampleItems[3], 1)}
          />
        </div>

        {/* Пример 5: Без обработчика клика */}
        <div>
          <h3 className="text-white text-sm mb-2 opacity-70">
            Предмет без клика (5 штук)
          </h3>
          <ItemCard 
            item={exampleItems[1]}
            amount={5} // ШТ - сколько выпадает за раз этих предметов
            orientation="horizontal"
            // Без onClick - предмет не кликабельный
          />
        </div>
      </div>

      {/* Объяснение элементов */}
      <div className="mt-8 p-4 bg-white/5 rounded-lg">
        <h3 className="text-white text-lg font-bold mb-3">
          Объяснение элементов компонента:
        </h3>
        <ul className="text-white/70 space-y-2 text-sm">
          <li>
            <strong className="text-white">X{'{число}'}</strong> - количество единиц в одном предмете, которое приходит из API (item.amount)
          </li>
          <li>
            <strong className="text-white">{'{число}'} ШТ.</strong> - сколько выпадает за раз этих предметов при открытии кейса (параметр amount)
          </li>
          <li>
            <strong className="text-white">{'{число}'} АР</strong> - оценка/стоимость предмета (item.price)
          </li>
        </ul>
      </div>

      {/* Инструкция по использованию */}
      <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <h3 className="text-blue-300 text-lg font-bold mb-3">
          Как использовать компонент:
        </h3>
        <pre className="text-blue-200/80 text-xs overflow-x-auto">
{`import { ItemCard } from '@/components/ui/RarityCard';

// Использование:
<ItemCard 
  item={caseItem}        // Предмет из API
  amount={3}             // Количество штук
  orientation="horizontal" // Ориентация карточки
  onClick={handleClick}  // Обработчик клика (опционально)
  className="custom-class" // Дополнительные стили (опционально)
/>`}
        </pre>
      </div>
    </div>
  );
}

/*
Примечания для будущих изменений:

1. X{число} (item.amount) - это количество единиц в одном предмете из API
   Например, если item.amount = 2, то отображается "x2"

2. {число} ШТ (amount) - это сколько выпадает за раз этих предметов
   Например, если amount = 3, то отображается "3 ШТ."

3. {число} АР (item.price) - это оценка/стоимость предмета
   Например, если item.price = 12.5, то отображается "12.5 АР"

4. Компонент поддерживает все типы редкости: Common, Uncommon, Rare, Epic, Legendary
   Каждая редкость имеет свой цвет фона и границы

5. onClick - опциональный параметр для обработки кликов по предмету
   Если не передан, предмет не будет кликабельным
*/