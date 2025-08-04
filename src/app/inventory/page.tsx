'use client';

import React from 'react';
import { usePreloadedData } from '@/components/providers/DataPreloadProvider';

export default function InventoryPage() {
  const { user, isAuthenticated } = usePreloadedData();
  
  // User data
  const userName = user?.nickname ?? (isAuthenticated ? 'Loading...' : 'Guest');

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-8">
      <div className="text-center py-12">
      </div>
    </div>
  );
}