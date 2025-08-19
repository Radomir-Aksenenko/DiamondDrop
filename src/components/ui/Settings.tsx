'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Компонент настроек для привилегированных пользователей
 */
export default function Settings({ isOpen, onClose }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'admin' | 'system'>('general');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-[#18181D] rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[#F9F8FC] font-unbounded text-xl font-medium">Настройки</h2>
                <button
                  onClick={onClose}
                  className="flex w-8 h-8 items-center justify-center rounded-lg bg-[#F9F8FC]/[0.05] hover:bg-[#F9F8FC]/[0.1] transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L13 13M1 13L13 1" stroke="#F9F8FC" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
                  </svg>
                </button>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-6 p-1 bg-[#F9F8FC]/[0.05] rounded-lg">
                <button
                  onClick={() => setActiveTab('general')}
                  className={`flex-1 px-4 py-2 rounded-md font-actay-wide text-sm font-bold transition-all ${
                    activeTab === 'general'
                      ? 'bg-[#5C5ADC] text-[#F9F8FC]'
                      : 'text-[#F9F8FC] opacity-50 hover:opacity-70'
                  }`}
                >
                  Общие
                </button>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex-1 px-4 py-2 rounded-md font-actay-wide text-sm font-bold transition-all ${
                    activeTab === 'admin'
                      ? 'bg-[#5C5ADC] text-[#F9F8FC]'
                      : 'text-[#F9F8FC] opacity-50 hover:opacity-70'
                  }`}
                >
                  Админ
                </button>
                <button
                  onClick={() => setActiveTab('system')}
                  className={`flex-1 px-4 py-2 rounded-md font-actay-wide text-sm font-bold transition-all ${
                    activeTab === 'system'
                      ? 'bg-[#5C5ADC] text-[#F9F8FC]'
                      : 'text-[#F9F8FC] opacity-50 hover:opacity-70'
                  }`}
                >
                  Система
                </button>
              </div>

              {/* Content */}
              <div className="space-y-4">
                {activeTab === 'general' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#F9F8FC]/[0.05] rounded-lg">
                      <h3 className="text-[#F9F8FC] font-actay-wide text-base font-bold mb-2">Уведомления</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between">
                          <span className="text-[#F9F8FC] font-actay text-sm opacity-70">Звуковые уведомления</span>
                          <input type="checkbox" className="w-4 h-4 rounded bg-[#F9F8FC]/[0.1] border-[#F9F8FC]/[0.2]" defaultChecked />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-[#F9F8FC] font-actay text-sm opacity-70">Push-уведомления</span>
                          <input type="checkbox" className="w-4 h-4 rounded bg-[#F9F8FC]/[0.1] border-[#F9F8FC]/[0.2]" />
                        </label>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-[#F9F8FC]/[0.05] rounded-lg">
                      <h3 className="text-[#F9F8FC] font-actay-wide text-base font-bold mb-2">Интерфейс</h3>
                      <div className="space-y-3">
                        <label className="flex items-center justify-between">
                          <span className="text-[#F9F8FC] font-actay text-sm opacity-70">Темная тема</span>
                          <input type="checkbox" className="w-4 h-4 rounded bg-[#F9F8FC]/[0.1] border-[#F9F8FC]/[0.2]" defaultChecked />
                        </label>
                        <label className="flex items-center justify-between">
                          <span className="text-[#F9F8FC] font-actay text-sm opacity-70">Анимации</span>
                          <input type="checkbox" className="w-4 h-4 rounded bg-[#F9F8FC]/[0.1] border-[#F9F8FC]/[0.2]" defaultChecked />
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'admin' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#F9F8FC]/[0.05] rounded-lg">
                      <h3 className="text-[#F9F8FC] font-actay-wide text-base font-bold mb-2">Управление пользователями</h3>
                      <div className="space-y-3">
                        <button className="w-full p-3 bg-[#5C5ADC]/[0.1] hover:bg-[#5C5ADC]/[0.2] rounded-lg text-[#5C5ADC] font-actay-wide text-sm font-bold transition-colors">
                          Список пользователей
                        </button>
                        <button className="w-full p-3 bg-[#EDD51D]/[0.1] hover:bg-[#EDD51D]/[0.2] rounded-lg text-[#EDD51D] font-actay-wide text-sm font-bold transition-colors">
                          Модерация
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-[#F9F8FC]/[0.05] rounded-lg">
                      <h3 className="text-[#F9F8FC] font-actay-wide text-base font-bold mb-2">Управление контентом</h3>
                      <div className="space-y-3">
                        <button className="w-full p-3 bg-[#5C5ADC]/[0.1] hover:bg-[#5C5ADC]/[0.2] rounded-lg text-[#5C5ADC] font-actay-wide text-sm font-bold transition-colors">
                          Управление кейсами
                        </button>
                        <button className="w-full p-3 bg-[#5C5ADC]/[0.1] hover:bg-[#5C5ADC]/[0.2] rounded-lg text-[#5C5ADC] font-actay-wide text-sm font-bold transition-colors">
                          Управление предметами
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'system' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-[#F9F8FC]/[0.05] rounded-lg">
                      <h3 className="text-[#F9F8FC] font-actay-wide text-base font-bold mb-2">Системная информация</h3>
                      <div className="space-y-2 text-[#F9F8FC] font-actay text-sm opacity-70">
                        <div className="flex justify-between">
                          <span>Версия:</span>
                          <span>1.0.0</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Сборка:</span>
                          <span>2024.01.15</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Статус сервера:</span>
                          <span className="text-green-400">Онлайн</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-[#F9F8FC]/[0.05] rounded-lg">
                      <h3 className="text-[#F9F8FC] font-actay-wide text-base font-bold mb-2">Действия</h3>
                      <div className="space-y-3">
                        <button className="w-full p-3 bg-red-500/[0.1] hover:bg-red-500/[0.2] rounded-lg text-red-400 font-actay-wide text-sm font-bold transition-colors">
                          Очистить кэш
                        </button>
                        <button className="w-full p-3 bg-[#EDD51D]/[0.1] hover:bg-[#EDD51D]/[0.2] rounded-lg text-[#EDD51D] font-actay-wide text-sm font-bold transition-colors">
                          Перезагрузить конфигурацию
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}