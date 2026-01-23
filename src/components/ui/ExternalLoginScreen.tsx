'use client';

import { useState } from 'react';

interface ExternalLoginScreenProps {
    onTokenSubmit: (token: string) => void;
}

export default function ExternalLoginScreen({ onTokenSubmit }: ExternalLoginScreenProps) {
    const [token, setToken] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!token.trim()) {
            setError('Введите токен');
            return;
        }

        onTokenSubmit(token.trim());
    };

    return (
        <div className="fixed inset-0 bg-[#0D0D11] flex items-center justify-center z-50">
            <div className="relative z-10 w-full max-w-sm px-4 animate-slide-up">
                {/* Контейнер в стиле Modal */}
                <div className="bg-[#151519] p-6 rounded-[16px] shadow-2xl border border-[#F9F8FC]/[0.05]">
                    <div className="text-center mb-6">
                        <h1 className="text-xl font-bold text-[#F9F8FC] mb-2 font-unbounded">
                            DiamondDrop
                        </h1>
                        <p className="text-[#F9F8FC]/30 text-xs font-bold font-['Actay_Wide']">
                            Вход через токен доступа
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={token}
                                onChange={(e) => {
                                    setToken(e.target.value);
                                    setError(null);
                                }}
                                className={`w-full bg-[#19191D] text-[#F9F8FC] px-3 py-3 rounded-lg outline-none text-base font-unbounded transition-all duration-200 ${error
                                        ? 'border border-red-500'
                                        : 'border border-transparent focus:border-[#5C5ADC]'
                                    } placeholder-[#F9F8FC]/20`}
                                placeholder="Ваш токен"
                            />
                            {error && (
                                <p className="text-red-500 text-[10px] mt-1 font-bold">*{error}</p>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!token}
                            className={`w-full bg-[#5C5ADC] hover:bg-[#4A48B0] py-2.5 px-4 rounded-lg text-[#F9F8FC] font-bold font-unbounded text-sm cursor-pointer transition-all duration-200 outline-none focus:outline-none active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            Войти
                        </button>
                    </form>

                    <p className="text-[#F9F8FC]/20 text-[10px] mt-4 text-center leading-relaxed font-bold font-['Actay_Wide']">
                        Используйте токен из настроек профиля<br />
                        для авторизации вне приложения
                    </p>
                </div>
            </div>
        </div>
    );
}
