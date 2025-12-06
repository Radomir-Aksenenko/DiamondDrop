'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams, notFound } from 'next/navigation';
import { motion, useAnimation } from 'framer-motion';
import CaseItemCard from '@/components/ui/CaseItemCard';
import CaseSlotItemCard from '@/components/ui/CaseSlotItemCard';
import ItemDescriptionModal from '@/components/ui/ItemDescriptionModal';
import { API_BASE_URL } from '@/lib/config';
import { CaseItem } from '@/hooks/useCasesAPI';
import { getAuthToken } from '@/lib/auth';
import useBonusCaseAPI from '@/hooks/useBonusCaseAPI';

interface CaseOpenResult {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  amount: number;
  price: number;
  percentChance: number;
  rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic' | 'Legendary';
  isWithdrawable: boolean;
  stackAmount?: number | null;
}

export default function BonusCasePage() {
  const router = useRouter();
  const params = useParams();
  const levelParam = params.level as string;
  const numericLevel = Number(levelParam);
  const normalizedLevel = Number.isFinite(numericLevel) ? numericLevel : null;

  const { bonusCase, loading, error, refresh } = useBonusCaseAPI(normalizedLevel);
  const caseData = bonusCase?.case || null;

  const [isFastMode, setIsFastMode] = useState(false);
  const selectedNumber: number = 1;
  const [savedLayouts, setSavedLayouts] = useState<{ [key: string]: CaseItem[] }>({});
  const [isSpinning, setIsSpinning] = useState(false);
  const [isItemDescriptionModalOpen, setIsItemDescriptionModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CaseItem | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Определяем, нужен ли компактный режим для карточек
  const [isCompactCards, setIsCompactCards] = useState(false);

  useEffect(() => {
    const checkCompactMode = () => {
      const isMobile = window.innerWidth < 768;
      setIsCompactCards(isMobile);
    };

    checkCompactMode();
    window.addEventListener('resize', checkCompactMode);

    return () => window.removeEventListener('resize', checkCompactMode);
  }, []);

  const field1Controls = useAnimation();
  const field2Controls = useAnimation();
  const field3Controls = useAnimation();
  const field4Controls = useAnimation();

  // Refs для контейнеров рулетки - для точного измерения размеров
  const rouletteContainerRef = useRef<HTMLDivElement>(null);

  const getSortedItems = () => {
    if (!caseData?.items) return [];
    return [...caseData.items].sort((a, b) => b.price - a.price);
  };

  const getCaseImageUrl = () => {
    if (!caseData?.imageUrl) {
      return '/09b1b0e86eb0cd8a7909f6f74b56ddc17804658d.png';
    }
    if (caseData.imageUrl.startsWith('http://') || caseData.imageUrl.startsWith('https://')) {
      return caseData.imageUrl;
    }
    if (caseData.imageUrl.startsWith('/')) {
      return `${API_BASE_URL}${caseData.imageUrl}`;
    }
    return `${API_BASE_URL}/${caseData.imageUrl}`;
  };

  const handleOpenItemDescriptionModal = (item: CaseItem) => {
    setSelectedItem(item);
    setIsItemDescriptionModalOpen(true);
  };

  const handleCloseItemDescriptionModal = () => {
    setIsItemDescriptionModalOpen(false);
  };

  const getRandomItem = () => {
    if (!caseData?.items || caseData.items.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * caseData.items.length);
    return caseData.items[randomIndex];
  };

  const generateRandomItems = (fieldKey: string) => {
    if (!caseData?.items || caseData.items.length === 0) return [];
    const layoutKey = `${selectedNumber}-${fieldKey}`;
    if (savedLayouts[layoutKey]) {
      return savedLayouts[layoutKey];
    }

    const baseItemCount = selectedNumber === 1 ? 50 : 40;
    const items: CaseItem[] = [];

    for (let i = 0; i < baseItemCount; i++) {
      const randomItem = getRandomItem();
      if (randomItem) {
        items.push({ ...randomItem, id: `${randomItem.id}-${fieldKey}-${i}` });
      }
    }

    const cycleLength = Math.min(20, baseItemCount);
    const displayItems: CaseItem[] = [];

    for (let cycle = 0; cycle < 3; cycle++) {
      for (let j = 0; j < cycleLength; j++) {
        const sourceIndex = j % items.length;
        const cyclicItem = { ...items[sourceIndex], id: `${items[sourceIndex].id}-display-${cycle}-${j}` };
        displayItems.push(cyclicItem);
      }
    }

    displayItems.push(...items);

    setSavedLayouts(prev => ({
      ...prev,
      [layoutKey]: displayItems,
    }));

    return displayItems;
  };

  const canClaimBonus = Boolean(bonusCase?.hasLevelAccess && bonusCase?.canClaim);

  const formatCooldownText = () => {
    if (!bonusCase) return '';
    if (!bonusCase.hasLevelAccess) {
      return `Кейс доступен с уровня ${bonusCase.level}. Ваш уровень: ${bonusCase.userLevel}.`;
    }
    if (!bonusCase.canClaim) {
      if (bonusCase.nextAvailableAt) {
        const next = new Date(bonusCase.nextAvailableAt);
        return `Доступно ${next.toLocaleString()}`;
      }
      if (typeof bonusCase.hoursUntilNextClaim === 'number') {
        const hours = Math.floor(bonusCase.hoursUntilNextClaim);
        const minutes = Math.round((bonusCase.hoursUntilNextClaim - hours) * 60);
        return `Доступно через ${hours}ч ${minutes}м`;
      }
      return 'Кейс скоро будет доступен';
    }
    return '';
  };

  const formatCountdown = (ms: number) => {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  const getMsUntilAvailable = () => {
    if (!bonusCase || !bonusCase.hasLevelAccess || bonusCase.canClaim) return 0;
    if (bonusCase.nextAvailableAt) {
      const next = new Date(bonusCase.nextAvailableAt).getTime();
      return Math.max(0, next - now);
    }
    if (typeof bonusCase.hoursUntilNextClaim === 'number') {
      return Math.max(0, Math.round(bonusCase.hoursUntilNextClaim * 60 * 60 * 1000));
    }
    return 0;
  };

  let buttonMainText = isSpinning ? 'Открываем...' : 'Открыть';
  let buttonSubText: string | null = isSpinning ? null : 'Бесплатно';

  if (!canClaimBonus) {
    if (bonusCase && !bonusCase.hasLevelAccess) {
      buttonMainText = `LVL ${bonusCase.level}`;
      buttonSubText = `Ваш уровень: ${bonusCase.userLevel}`;
    } else {
      const msLeft = getMsUntilAvailable();
      buttonMainText = formatCountdown(msLeft);
      buttonSubText = 'До открытия';
    }
  }

  const isButtonDisabled = isSpinning || !canClaimBonus;

  const handleOpenCase = async (isDemo: boolean = false) => {
    if (isSpinning || !caseData) return;

    setActionError(null);

    if (!isDemo) {
      if (!bonusCase?.hasLevelAccess) {
        setActionError(`Кейс доступен с уровня ${bonusCase?.level ?? '-'} (ваш уровень: ${bonusCase?.userLevel ?? '-'})`);
        return;
      }
      if (!bonusCase?.canClaim) {
        setActionError(formatCooldownText() || 'Кейс пока недоступен');
        return;
      }
    }

    await openCase(isDemo);
  };

  const openCase = async (isDemo: boolean = false) => {
    if (!caseData) return;

    try {
      setIsSpinning(true);
      setActionError(null);

      field1Controls.stop();
      field2Controls.stop();
      field3Controls.stop();
      field4Controls.stop();

      if (isDemo) {
        const demoResults: CaseOpenResult[] = [];
        for (let i = 0; i < selectedNumber; i++) {
          const item = getRandomItem();
          if (item) {
            demoResults.push({
              ...item,
              description: item.description,
            });
          }
        }
        if (demoResults.length === 0) {
          setIsSpinning(false);
          return;
        }
        await startSpinAnimation(demoResults);
        return;
      }

      const token = getAuthToken();
      if (!token) {
        throw new Error('Токен авторизации не найден');
      }

      const response = await fetch(`${API_BASE_URL}/bonus/claim/${bonusCase?.level ?? normalizedLevel}`, {
        method: 'POST',
        headers: {
          accept: '*/*',
          Authorization: token,
        },
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const message = payload?.error ?? `Ошибка открытия бонусного кейса (status: ${response.status})`;
        throw new Error(message);
      }

      const normalizedResults: CaseOpenResult[] = Array.isArray(payload) ? payload : payload ? [payload] : [];
      if (normalizedResults.length === 0) {
        throw new Error('Пустой ответ от сервера');
      }

      await startSpinAnimation(normalizedResults);
      refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Произошла ошибка при открытии бонусного кейса';
      setActionError(message);
      setIsSpinning(false);
    }
  };

  const startSpinAnimation = async (results: CaseOpenResult[]) => {
    const baseDuration = isFastMode ? 1.5 : 6;
    const horizontalDuration = baseDuration;
    const verticalDuration = baseDuration;

    // Определяем, используется ли компактный режим
    // Используем состояние компонента для согласованности с рендерингом
    const isMobile = isCompactCards;

    setSavedLayouts(prev => {
      const newLayouts = { ...prev };
      for (let i = 0; i < selectedNumber; i++) {
        const fieldKey = `field${i + 1}`;
        const layoutKey = `${selectedNumber}-${fieldKey}`;
        delete newLayouts[layoutKey];
      }
      return newLayouts;
    });

    const controls = [field1Controls, field2Controls, field3Controls, field4Controls];
    const animationPromises = [];

    for (let i = 0; i < selectedNumber; i++) {
      const fieldKey = `field${i + 1}`;
      const targetItem = results[i];
      const fieldControl = controls[i];

      if (targetItem && fieldControl) {
        const targetCaseItem: CaseItem = {
          id: targetItem.id,
          name: targetItem.name,
          description: targetItem.description,
          imageUrl: targetItem.imageUrl,
          amount: targetItem.amount,
          price: targetItem.price,
          percentChance: targetItem.percentChance,
          rarity: targetItem.rarity,
          isWithdrawable: targetItem.isWithdrawable,
          stackAmount: targetItem.stackAmount,
        };

        const infiniteItems: CaseItem[] = [];
        const baseItemCount = selectedNumber === 1 ? 150 : 60;
        const cycles = selectedNumber === 1 ? Math.floor(Math.random() * 3) + 4 : Math.floor(Math.random() * 3) + 2;
        for (let cycle = 0; cycle < cycles; cycle++) {
          for (let j = 0; j < baseItemCount; j++) {
            const randomItem = getRandomItem();
            if (randomItem) {
              infiniteItems.push({ ...randomItem, id: `${randomItem.id}-${fieldKey}-cycle-${cycle}-${j}` });
            }
          }
        }

        const additionalItemsBeforeWin = selectedNumber === 1
          ? Math.floor(Math.random() * 30) + 20
          : Math.floor(Math.random() * 15) + 10;
        for (let j = 0; j < additionalItemsBeforeWin; j++) {
          const randomItem = getRandomItem();
          if (randomItem) {
            infiniteItems.push({ ...randomItem, id: `${randomItem.id}-${fieldKey}-before-${j}` });
          }
        }

        const targetIndex = infiniteItems.length;
        infiniteItems.push({ ...targetCaseItem, id: `${targetCaseItem.id}-${fieldKey}-target` });

        const additionalCardsAfterWin = selectedNumber === 1 ? 30 : 10;
        for (let j = 0; j < additionalCardsAfterWin; j++) {
          const randomItem = getRandomItem();
          if (randomItem) {
            infiniteItems.push({ ...randomItem, id: `${randomItem.id}-${fieldKey}-after-${j}` });
          }
        }

        setSavedLayouts(prev => ({
          ...prev,
          [`${selectedNumber}-${fieldKey}`]: infiniteItems,
        }));

        // Вычисляем размеры карточек в зависимости от устройства
        // Используем точные значения пикселей, соответствующие CSS
        const cardWidth = isMobile ? 56 : 76;
        const cardHeight = isMobile ? 74 : 100;
        const gap = isMobile ? 6 : 8;

        let animationPromise;

        if (selectedNumber === 1) {
          // Горизонтальная прокрутка для одного кейса
          const itemWidth = cardWidth + gap;

          // Получаем реальную ширину контейнера
          let containerWidth = 663; // Default Desktop width

          if (rouletteContainerRef.current) {
            // Если ref доступен, используем его реальную ширину для точности
            const rect = rouletteContainerRef.current.getBoundingClientRect();
            containerWidth = rect.width;
          }

          // Начальная позиция
          const initialOffset = 0;

          // Генерируем случайное смещение в пределах карточки
          const randomOffset = (Math.random() - 0.5) * (isMobile ? 30 : 60);

          // Финальная позиция - центрируем выигрышный предмет + случайное смещение
          const finalOffset = -(targetIndex * itemWidth) + (containerWidth / 2) - (cardWidth / 2) + randomOffset;

          // Устанавливаем начальную позицию
          fieldControl.set({ x: initialOffset });

          // Создаем анимацию с плавной остановкой для горизонтальной прокрутки
          animationPromise = fieldControl.start({
            x: finalOffset,
            transition: {
              duration: horizontalDuration,
              ease: [0.23, 1, 0.32, 1],
            },
          });

        } else {
          // Вертикальная прокрутка (код оставлен для совместимости, но selectedNumber всегда 1 здесь)
          const itemHeight = cardHeight + gap;
          let containerHeight = 272;

          if (isMobile) {
            containerHeight = 184;
          }

          const initialOffset = 0;
          const randomOffset = (Math.random() - 0.5) * (isMobile ? 40 : 80);
          const finalOffset = -(targetIndex * itemHeight) + (containerHeight / 2) - (cardHeight / 2) + randomOffset;

          fieldControl.set({ y: initialOffset });

          animationPromise = fieldControl.start({
            y: finalOffset,
            transition: {
              duration: verticalDuration,
              ease: [0.23, 1, 0.32, 1],
            },
          });
        }

        animationPromises.push(animationPromise);
      }
    }

    try {
      await Promise.all(animationPromises);
      setIsSpinning(false);
    } catch (err) {
      console.error('Animation error:', err);
      setIsSpinning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-xl mb-4">Error: {error}</div>
          <button
            onClick={() => router.back()}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!caseData) {
    notFound();
  }

  return (
    <div className="min-h-[calc(100vh-85px-1rem)] md:h-[calc(100vh-85px-1rem)] flex flex-col items-start gap-4 md:gap-6 flex-1 self-stretch overflow-hidden px-2 md:px-0">
      <button
        onClick={() => router.back()}
        className="flex w-full h-[36px] md:h-[42px] items-center gap-2 md:gap-4 cursor-pointer"
      >
        <motion.div
          className="flex w-[36px] h-[36px] md:w-[42px] md:h-[42px] flex-col justify-center items-center gap-[10px] flex-shrink-0 rounded-[8px] bg-[#F9F8FC]/[0.05]"
          whileHover={{ backgroundColor: 'rgba(249, 248, 252, 0.1)' }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        >
          <img
            src="/Arrow - Left.svg"
            alt="Назад"
            width={18}
            height={12}
            className="w-[14px] h-[10px] md:w-[18px] md:h-[12px]"
          />
        </motion.div>
        <p className='text-[#F9F8FC] font-unbounded text-lg md:text-2xl font-medium'>Фри Кейсы</p>
      </button>

      <div className='flex flex-col md:flex-row items-start gap-5 flex-[1_0_0] self-stretch'>
        <div className='flex flex-col items-start gap-2 flex-1 w-full md:w-auto'>
          <div className="flex flex-col items-start gap-3 self-stretch p-5 md:p-6 rounded-xl bg-[#F9F8FC]/[0.05] w-full md:w-[679px] h-auto md:h-[288px]">
            <div className='flex flex-col md:flex-row h-auto md:h-[256px] items-center gap-5 md:gap-4 self-stretch'>
              <img
                src={getCaseImageUrl()}
                alt={`Изображение кейса ${caseData?.name}`}
                width={256}
                height={256}
                className="object-cover rounded-lg w-[160px] h-[160px] md:w-[256px] md:h-[256px] flex-shrink-0"
              />

              <div className='flex py-2 flex-col justify-between items-start flex-1 self-stretch w-full md:w-auto'>
                <div className='flex flex-col items-start gap-1 md:gap-2 self-stretch'>
                  <h1 className='text-[#F9F8FC] font-unbounded text-base md:text-xl font-medium'>
                    {caseData?.name} · LVL {bonusCase?.level ?? numericLevel}
                  </h1>
                  <p className="text-[#F9F8FC] font-['Actay_Wide'] text-xs md:text-sm font-bold opacity-30 leading-relaxed line-clamp-2 md:line-clamp-none">
                    {caseData?.description || 'Case description not available'}
                  </p>
                </div>

                <p className="text-[10px] md:text-xs text-[#F9F8FC]/60 font-actay-wide">
                  Бонусный кейс можно открывать только по одному разу.
                </p>

                <div className='flex items-center gap-2 md:gap-4 self-stretch'>
                  <div className='flex items-center gap-3 md:gap-2'>
                    <img
                      src="/Fast.svg"
                      alt="Иконка быстрого режима"
                      width={10}
                      height={14}
                      className="flex-shrink-0 w-[8px] h-[11px] md:w-[10px] md:h-[14px]"
                    />
                    <p className="text-[#F9F8FC] font-['Actay_Wide'] text-xs md:text-base font-bold">Быстрый режим</p>
                    <motion.button
                      onClick={() => {
                        if (isSpinning) return;
                        setIsFastMode(!isFastMode);
                      }}
                      disabled={isSpinning}
                      className={`flex w-[27px] h-[15px] p-[2px] ${isSpinning
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer'
                        } ${isFastMode ? 'justify-end bg-[#5C5ADC]' : 'justify-start bg-[#F9F8FC]/[0.10]'
                        } items-center rounded-[100px] transition-colors duration-200`}
                    >
                      <motion.div
                        className='w-[11px] h-[11px] flex-shrink-0 rounded-[100px] bg-[#F9F8FC]'
                        layout
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </motion.button>
                  </div>
                </div>

                <div className='flex flex-col gap-1 self-stretch w-full md:w-auto'>
                  <div className='flex items-center gap-3 md:gap-2 w-full md:w-auto'>
                    <motion.button
                      onClick={() => handleOpenCase(false)}
                      disabled={isButtonDisabled}
                      className={`flex px-3 py-2 md:px-4 md:py-3 justify-center items-center gap-2 rounded-xl transition-colors duration-200 flex-1 md:flex-initial ${isButtonDisabled
                        ? 'bg-[#5C5ADC]/50 cursor-not-allowed'
                        : 'bg-[#5C5ADC] cursor-pointer'
                        }`}
                      whileHover={!isButtonDisabled ? { backgroundColor: "#6462DE" } : {}}
                      whileTap={!isButtonDisabled ? { scale: 0.98 } : {}}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <div className="flex flex-col items-center leading-tight text-center">
                        <span className="text-[#F9F8FC] font-unbounded text-sm md:text-base font-medium">
                          {buttonMainText}
                        </span>
                        {buttonSubText && (
                          <span className='text-[#F9F8FC]/70 font-actay-wide text-[10px] md:text-xs'>
                            {buttonSubText}
                          </span>
                        )}
                      </div>
                    </motion.button>

                    <motion.button
                      onClick={() => handleOpenCase(true)}
                      disabled={isSpinning}
                      className={`flex px-3 py-2 md:px-4 md:py-3 justify-center items-center gap-[10px] rounded-[8px] bg-[#F9F8FC]/[0.05] text-[#F9F8FC] font-unbounded text-xs md:text-sm font-medium transition-colors duration-200 ${isSpinning ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                        }`}
                      whileHover={!isSpinning ? { backgroundColor: "#242428" } : {}}
                      whileTap={!isSpinning ? { scale: 0.98 } : {}}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      Демо
                    </motion.button>
                  </div>
                  {actionError && (
                    <p className="text-[10px] md:text-xs font-actay-wide text-[#E74A4A]">
                      {actionError}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex p-2 md:p-[10px] items-start rounded-xl bg-[#F9F8FC]/[0.05] w-full md:w-[679px] h-[200px] md:h-[288px]">
            <div className="flex w-full h-full gap-1.5 md:gap-[8px]">
              {selectedNumber === 1 && (
                <div ref={rouletteContainerRef} className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden flex justify-center items-center">
                  <motion.div
                    className="flex items-center p-2"
                    animate={field1Controls}
                    style={{
                      width: 'max-content',
                      minWidth: '100%',
                      gap: isCompactCards ? '6px' : '8px'
                    }}
                  >
                    {(savedLayouts[`${selectedNumber}-field1`] || generateRandomItems('field1')).map((item, index) => (
                      <CaseSlotItemCard
                        key={`field1-${item.id}-${index}`}
                        item={item}
                        className="flex-shrink-0"
                        compact={isCompactCards}
                      />
                    ))}
                  </motion.div>
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gradient-to-b from-white/60 via-white/70 to-white/60 z-10 pointer-events-none shadow-md shadow-white/10">
                  </div>
                </div>
              )}

              {selectedNumber === 2 && (
                <>
                  <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                    <motion.div
                      className="flex flex-col items-center gap-2 p-2"
                      animate={field1Controls}
                    >
                      {(savedLayouts[`${selectedNumber}-field1`] || generateRandomItems('field1')).map((item, index) => (
                        <CaseSlotItemCard
                          key={`field1-${item.id}-${index}`}
                          item={item}
                        />
                      ))}
                    </motion.div>
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-0.5 bg-gradient-to-r from-white/60 via-white/70 to-white/60 z-10 pointer-events-none shadow-md shadow-white/10">
                    </div>
                  </div>
                  <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                    <motion.div
                      className="flex flex-col items-center gap-2 p-2"
                      animate={field2Controls}
                    >
                      {(savedLayouts[`${selectedNumber}-field2`] || generateRandomItems('field2')).map((item, index) => (
                        <CaseSlotItemCard
                          key={`field2-${item.id}-${index}`}
                          item={item}
                        />
                      ))}
                    </motion.div>
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-0.5 bg-gradient-to-r from-white/60 via-white/70 to-white/60 z-10 pointer-events-none shadow-md shadow-white/10">
                    </div>
                  </div>
                </>
              )}

              {selectedNumber === 3 && (
                <>
                  <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                    <motion.div
                      className="flex flex-col items-center gap-2 p-2"
                      animate={field1Controls}
                    >
                      {(savedLayouts[`${selectedNumber}-field1`] || generateRandomItems('field1')).map((item, index) => (
                        <CaseSlotItemCard
                          key={`field1-${item.id}-${index}`}
                          item={item}
                        />
                      ))}
                    </motion.div>
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-0.5 bg-gradient-to-r from-white/60 via-white/70 to-white/60 z-10 pointer-events-none shadow-md shadow-white/10">
                    </div>
                  </div>
                  <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                    <motion.div
                      className="flex flex-col items-center gap-2 p-2"
                      animate={field2Controls}
                    >
                      {(savedLayouts[`${selectedNumber}-field2`] || generateRandomItems('field2')).map((item, index) => (
                        <CaseSlotItemCard
                          key={`field2-${item.id}-${index}`}
                          item={item}
                        />
                      ))}
                    </motion.div>
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-0.5 bg-gradient-to-r from-white/60 via-white/70 to-white/60 з-10 pointer-events-none shadow-white/10">
                    </div>
                  </div>
                  <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                    <motion.div
                      className="flex flex-col items-center gap-2 п-2"
                      animate={field3Controls}
                    >
                      {(savedLayouts[`${selectedNumber}-field3`] || generateRandomItems('field3')).map((item, index) => (
                        <CaseSlotItemCard
                          key={`field3-${item.id}-${index}`}
                          item={item}
                        />
                      ))}
                    </motion.div>
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-0.5 bg-gradient-to-r from-white/60 via-white/70 to-white/60 з-10 pointer-events-none shadow-white/10">
                    </div>
                  </div>
                </>
              )}

              {selectedNumber === 4 && (
                <>
                  <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                    <motion.div
                      className="flex flex-col items-center gap-2 п-2"
                      animate={field1Controls}
                    >
                      {(savedLayouts[`${selectedNumber}-field1`] || generateRandomItems('field1')).map((item, index) => (
                        <CaseSlotItemCard
                          key={`field1-${item.id}-${index}`}
                          item={item}
                        />
                      ))}
                    </motion.div>
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-0.5 bg-gradient-to-r from-white/60 via-white/70 to-white/60 з-10 pointer-events-none shadow-white/10">
                    </div>
                  </div>
                  <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                    <motion.div
                      className="flex flex-col items-center gap-2 п-2"
                      animate={field2Controls}
                    >
                      {(savedLayouts[`${selectedNumber}-field2`] || generateRandomItems('field2')).map((item, index) => (
                        <CaseSlotItemCard
                          key={`field2-${item.id}-${index}`}
                          item={item}
                        />
                      ))}
                    </motion.div>
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-0.5 bg-gradient-to-r from-white/60 via-white/70 to-white/60 з-10 pointer-events-none shadow-white/10">
                    </div>
                  </div>
                  <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                    <motion.div
                      className="flex flex-col items-center gap-2 п-2"
                      animate={field3Controls}
                    >
                      {(savedLayouts[`${selectedNumber}-field3`] || generateRandomItems('field3')).map((item, index) => (
                        <CaseSlotItemCard
                          key={`field3-${item.id}-${index}`}
                          item={item}
                        />
                      ))}
                    </motion.div>
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-0.5 bg-gradient-to-r from-white/60 via-white/70 to-white/60 з-10 pointer-events-none shadow-white/10">
                    </div>
                  </div>
                  <div className="flex-1 h-full rounded-lg bg-[#0D0D11] relative overflow-hidden">
                    <motion.div
                      className="flex flex-col items-center gap-2 п-2"
                      animate={field4Controls}
                    >
                      {(savedLayouts[`${selectedNumber}-field4`] || generateRandomItems('field4')).map((item, index) => (
                        <CaseSlotItemCard
                          key={`field4-${item.id}-${index}`}
                          item={item}
                        />
                      ))}
                    </motion.div>
                    <div className="absolute top-1/2 left-0 transform -translate-y-1/2 w-full h-0.5 bg-gradient-to-r from-white/60 via-white/70 to-white/60 з-10 pointer-events-none shadow-white/10">
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className='hidden md:flex w-[221px] flex-col rounded-xl bg-[#F9F8FC]/[0.05] overflow-hidden' style={{ height: '585px' }}>
          <div className='flex p-4 pb-2 justify-center items-center flex-shrink-0'>
            <h1 className='text-[#F9F8FC] font-unbounded text-xl font-medium'>В кейсе</h1>
          </div>
          <div className='flex-1 px-4 pb-4 min-h-0'>
            <motion.div
              className='h-full overflow-y-auto overflow-x-hidden pr-2'
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(249, 248, 252, 0.2) transparent'
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
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
              <div className='grid grid-cols-2 gap-2 w-full auto-rows-max'>
                {getSortedItems().length > 0 ? (
                  getSortedItems().map((item, index) => (
                    <motion.div
                      key={`${item.id}-${index}`}
                      className='w-full flex justify-center items-start'
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05,
                        ease: "easeOut"
                      }}
                    >
                      <CaseItemCard
                        item={item}
                        className='flex-shrink-0'
                        onClick={() => handleOpenItemDescriptionModal(item)}
                      />
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    className="text-[#F9F8FC]/50 font-unbounded text-sm text-center w-full col-span-2 py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    Предметы не найдены
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <ItemDescriptionModal
        isOpen={isItemDescriptionModalOpen}
        onClose={handleCloseItemDescriptionModal}
        item={selectedItem}
      />
    </div>
  );
}



