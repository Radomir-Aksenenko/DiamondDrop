'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { liveWinsSocket, BroadcastPayload } from '@/lib/liveWinsSocket';

interface BannerState extends BroadcastPayload {
  visible: boolean;
}

export default function BroadcastBanner() {
  const [banner, setBanner] = useState<BannerState | null>(null);

  const hide = useCallback(() => {
    setBanner(prev => (prev ? { ...prev, visible: false } : prev));
  }, []);

  useEffect(() => {
    const unsubscribe = liveWinsSocket.subscribe({
      onBroadcast: (payload) => {
        setBanner({ ...payload, visible: true });
      }
    });
    return () => {
      unsubscribe();
    };
  }, [hide]);

  if (!banner || !banner.visible) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60]">
      <div className="flex items-start gap-3 rounded-[16px] bg-[#151519] shadow-xl px-4 py-4 max-w-[90vw] w-[560px] border border-[rgba(249,248,252,0.05)]">
        {banner.imageUrl && (
          <img src={banner.imageUrl} alt="broadcast" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[#F9F8FC] font-['Actay_Wide'] text-lg font-bold leading-normal truncate">{banner.title}</p>
            <button onClick={hide} className="bg-[#19191D] hover:bg-[#1E1E23] transition-colors w-8 h-8 rounded-full text-[#F9F8FC] flex items-center justify-center cursor-pointer" aria-label="Закрыть" type="button">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className="bg-[#151519] p-0 rounded-lg mt-1">
            <p className="text-[#F9F8FC]/50 text-base whitespace-pre-wrap break-words">
              {banner.text}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


