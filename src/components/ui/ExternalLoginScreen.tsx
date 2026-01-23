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
            setError('Пожалуйста, введите токен');
            return;
        }

        onTokenSubmit(token.trim());
    };

    return (
        <div className="fixed inset-0 bg-[#0D0D11] flex items-center justify-center z-50">
            {/* Фоновая анимация в цветах сайта */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#5C5ADC] rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-[#5C5ADC] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
                <div className="absolute top-40 left-1/2 w-80 h-80 bg-[#5C5ADC] rounded-full mix-blend-multiply filter blur-xl opacity-25 animate-pulse animation-delay-4000"></div>
            </div>

            <div className="relative z-10 w-full max-w-md px-6 animate-slide-up">
                <div className="bg-[#19191D]/50 backdrop-blur-md p-8 rounded-2xl border border-[#5C5ADC]/20 shadow-xl shadow-[#5C5ADC]/10">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-[#F9F8FC] mb-2 font-unbounded">
                            DiamondDrop
                        </h1>
                        <p className="text-[#F9F8FC]/50 text-sm">
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
                                className={`w-full bg-[#0D0D11] text-[#F9F8FC] px-4 py-3.5 rounded-xl outline-none font-unbounded text-sm transition-all duration-200 ${error
                                        ? 'border border-red-500/50 focus:border-red-500'
                                        : 'border border-[#5C5ADC]/20 focus:border-[#5C5ADC]'
                                    } placeholder-[#F9F8FC]/30`}
                                placeholder="Введите ваш токен"
                            />
                            {error && (
                                <span className="absolute -bottom-5 left-0 text-xs text-red-400">
                                    {error}
                                </span>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={!token}
                            className={`mt-2 w-full bg-[#5C5ADC] hover:bg-[#4A48B0] text-[#F9F8FC] font-bold py-3.5 rounded-xl transition-all duration-200 font-unbounded hover:shadow-lg hover:shadow-[#5C5ADC]/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            Войти
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
