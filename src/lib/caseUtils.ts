import { CaseItem } from '@/hooks/useCasesAPI';

/**
 * Генерирует случайные предметы для кейса в dev режиме
 */
export function generateRandomItems(casePrice: number): CaseItem[] {
  const rarities: CaseItem['rarity'][] = ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'];
  const itemNames = [
    'Зачарованная книга', 'Алмазный меч', 'Золотое яблоко', 'Тотем бессмертия',
    'Элитры', 'Незеритовый слиток', 'Драконье яйцо', 'Маяк', 'Кондуит',
    'Зачарованное золотое яблоко', 'Стержень вихря', 'Кузнечный шаблон',
    'Зловещая бутылочка', 'Лук', 'Золотая морковь', 'Алмаз', 'Изумруд'
  ];
  
  const items: CaseItem[] = [];
  const itemCount = Math.floor(Math.random() * 6) + 5; // 5-10 предметов
  
  for (let i = 0; i < itemCount; i++) {
    const rarity = rarities[Math.floor(Math.random() * rarities.length)];
    const name = itemNames[Math.floor(Math.random() * itemNames.length)];
    
    // Базовая цена в зависимости от редкости
    let basePrice: number;
    let baseChance: number;
    
    switch (rarity) {
      case 'Legendary':
        basePrice = casePrice * (2 + Math.random() * 6); // 2-8x цены кейса
        baseChance = 1 + Math.random() * 4; // 1-5%
        break;
      case 'Epic':
        basePrice = casePrice * (1 + Math.random() * 3); // 1-4x цены кейса
        baseChance = 3 + Math.random() * 5; // 3-8%
        break;
      case 'Rare':
        basePrice = casePrice * (0.5 + Math.random() * 1.5); // 0.5-2x цены кейса
        baseChance = 6 + Math.random() * 8; // 6-14%
        break;
      case 'Uncommon':
        basePrice = casePrice * (0.2 + Math.random() * 0.8); // 0.2-1x цены кейса
        baseChance = 10 + Math.random() * 15; // 10-25%
        break;
      case 'Common':
        basePrice = casePrice * (0.05 + Math.random() * 0.3); // 0.05-0.35x цены кейса
        baseChance = 15 + Math.random() * 25; // 15-40%
        break;
    }
    
    items.push({
      id: `random-${i}-${Date.now()}-${Math.random()}`,
      name: name,
      description: Math.random() > 0.5 ? `Случайное описание для ${name}` : null,
      imageUrl: `https://assets.zaralx.ru/api/v1/minecraft/vanilla/item/${name.toLowerCase().replace(/\s+/g, '_')}/icon`,
      amount: Math.floor(Math.random() * 32) + 1,
      price: Math.round(basePrice * 100) / 100,
      percentChance: Math.round(baseChance * 100) / 100,
      rarity: rarity
    });
  }
  
  return items;
}