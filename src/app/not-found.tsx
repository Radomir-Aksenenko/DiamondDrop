'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * Страница 404 - Страница не найдена
 */
export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-85px-2rem)] flex flex-col items-center justify-center text-center px-4">
      {/* Анимированный контейнер */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center gap-8 max-w-md"
      >
        {/* Большая цифра 404 */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="relative"
        >
          <h1 className="text-8xl md:text-9xl font-unbounded font-bold text-[#5C5ADC] leading-none">
            404
          </h1>
          {/* Декоративный элемент - алмаз */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-br from-[#5C5ADC] to-[#4A48B0] transform rotate-45 rounded-lg shadow-lg shadow-[#5C5ADC]/30"
          />
        </motion.div>

        {/* Заголовок */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-2xl md:text-3xl font-unbounded font-medium text-[#F9F8FC]"
        >
          Страница не найдена
        </motion.h2>

        {/* Описание */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-[#F9F8FC] font-['Actay_Wide'] text-base font-bold opacity-60 leading-relaxed"
        >
          Похоже, что страница, которую вы ищете, не существует или была перемещена. 
          Не волнуйтесь, давайте вернем вас на правильный путь!
        </motion.p>

        {/* Кнопки действий */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 w-full"
        >
          {/* Кнопка "На главную" */}
          <Link href="/" className="flex-1">
            <motion.button
              className="w-full flex px-6 py-3 justify-center items-center gap-2 rounded-xl bg-[#5C5ADC] text-[#F9F8FC] font-unbounded text-sm font-medium transition-colors duration-200 cursor-pointer"
              whileHover={{ backgroundColor: "#6462DE" }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              На главную
            </motion.button>
          </Link>

          {/* Кнопка "Назад" */}
          <motion.button
            onClick={() => router.back()}
            className="flex-1 flex px-6 py-3 justify-center items-center gap-2 rounded-xl bg-[#F9F8FC]/[0.05] text-[#F9F8FC] font-unbounded text-sm font-medium transition-colors duration-200 cursor-pointer"
            whileHover={{ backgroundColor: "#242428" }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            Назад
          </motion.button>
        </motion.div>

        {/* Дополнительные ссылки */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          className="flex flex-wrap justify-center gap-6 text-sm"
        >
          <Link 
            href="/" 
            className="text-[#F9F8FC] opacity-60 hover:opacity-100 hover:text-[#5C5ADC] transition-all duration-200 font-['Actay_Wide'] font-bold"
          >
            Кейсы
          </Link>
          <Link 
            href="/profile" 
            className="text-[#F9F8FC] opacity-60 hover:opacity-100 hover:text-[#5C5ADC] transition-all duration-200 font-['Actay_Wide'] font-bold"
          >
            Профиль
          </Link>
          <Link 
            href="/about" 
            className="text-[#F9F8FC] opacity-60 hover:opacity-100 hover:text-[#5C5ADC] transition-all duration-200 font-['Actay_Wide'] font-bold"
          >
            О нас
          </Link>
        </motion.div>
      </motion.div>

      {/* Декоративные элементы на фоне */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute top-1/4 left-1/4 w-4 h-4 bg-gradient-to-br from-[#5C5ADC]/20 to-[#4A48B0]/20 transform rotate-45 rounded-sm"
        />
        <motion.div
          animate={{ 
            x: [0, -80, 0],
            y: [0, 60, 0],
            rotate: [360, 180, 0]
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute top-3/4 right-1/4 w-6 h-6 bg-gradient-to-br from-[#5C5ADC]/10 to-[#4A48B0]/10 transform rotate-45 rounded-lg"
        />
        <motion.div
          animate={{ 
            x: [0, 60, 0],
            y: [0, -80, 0],
            rotate: [0, 360, 0]
          }}
          transition={{ 
            duration: 30, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute top-1/2 right-1/3 w-3 h-3 bg-gradient-to-br from-[#5C5ADC]/15 to-[#4A48B0]/15 transform rotate-45 rounded"
        />
      </div>
    </div>
  );
}