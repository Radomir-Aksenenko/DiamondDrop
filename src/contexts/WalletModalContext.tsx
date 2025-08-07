'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WalletModalContextType {
  openWalletModal: (presetAmount?: number) => void;
  closeWalletModal: () => void;
  isWalletModalOpen: boolean;
  walletPresetAmount?: number;
}

const WalletModalContext = createContext<WalletModalContextType | undefined>(undefined);

interface WalletModalProviderProps {
  children: ReactNode;
}

export function WalletModalProvider({ children }: WalletModalProviderProps) {
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [walletPresetAmount, setWalletPresetAmount] = useState<number | undefined>(undefined);

  const openWalletModal = (presetAmount?: number) => {
    setWalletPresetAmount(presetAmount);
    setIsWalletModalOpen(true);
  };

  const closeWalletModal = () => {
    setIsWalletModalOpen(false);
    setWalletPresetAmount(undefined);
  };

  const value: WalletModalContextType = {
    openWalletModal,
    closeWalletModal,
    isWalletModalOpen,
    walletPresetAmount,
  };

  return (
    <WalletModalContext.Provider value={value}>
      {children}
    </WalletModalContext.Provider>
  );
}

export function useWalletModal() {
  const context = useContext(WalletModalContext);
  if (context === undefined) {
    throw new Error('useWalletModal must be used within a WalletModalProvider');
  }
  return context;
}