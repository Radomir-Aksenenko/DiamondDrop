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
        // auto hide after 8s
        setTimeout(() => {
          hide();
        }, 8000);
      }
    });
    return () => unsubscribe();
  }, [hide]);

  if (!banner || !banner.visible) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60]">
      <div className="flex items-start gap-3 rounded-xl bg-[rgba(21,21,25,0.95)] border border-[rgba(249,248,252,0.1)] shadow-xl px-4 py-3 max-w-[90vw] w-[520px]">
        {banner.imageUrl && (
          <img src={banner.imageUrl} alt="broadcast" className="w-12 h-12 rounded-md object-cover flex-shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <p className="text-[#F9F8FC] font-['Actay_Wide'] text-base font-bold truncate">{banner.title}</p>
            <button onClick={hide} className="text-[#F9F8FC]/60 hover:text-[#F9F8FC] cursor-pointer">✕</button>
          </div>
          <p className="text-[#F9F8FC]/70 text-sm mt-1 whitespace-pre-wrap break-words">
            {banner.text}
          </p>
        </div>
      </div>
    </div>
  );
}


