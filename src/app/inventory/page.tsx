'use client';

import React from 'react';
import { usePreloadedData } from '@/components/providers/DataPreloadProvider';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { motion, useAnimation } from 'framer-motion';

export default function InventoryPage() {
  const { user, isAuthenticated } = usePreloadedData();
  
  // User data
  const userName = user?.nickname ?? (isAuthenticated ? 'Loading...' : 'Guest');

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pt-8 flex flex-col items-start gap-4 self-stretch">
      <button 
        onClick={() => {
          const router = useRouter();
          router.back();
        }}
        className="flex w-full h-[42px] items-center gap-4 cursor-pointer"
      >
        <motion.div 
          className="flex w-[42px] h-[42px] flex-col justify-center items-center gap-[10px] flex-shrink-0 rounded-[8px] bg-[#F9F8FC]/[0.05]"
          whileHover={{ backgroundColor: "rgba(249, 248, 252, 0.1)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <Image 
            src="/Arrow - Left.svg" 
            alt="Назад" 
            width={18} 
            height={12} 
            className="w-[18px] h-[12px]"
          />
        </motion.div>
        <p className='text-[#F9F8FC] font-unbounded text-2xl font-medium'>Профиль</p>
      </button>
      <div className='flex h-[202px] p-4 items-start gap-4 self-stretch rounded-xl bg-[#F9F8FC]/[0.05]'>
        <div className='flex w-[170px] h-[170px] aspect-[1/1] rounded-lg bg-[#5C5ADC] relative overflow-hidden'>
          <>
          <img
              src="https://vzge.me/front/512/megatntmega.png"
              alt="Avatar"
              className="absolute w-[154px] h-[154px] aspect-square ml-[7px] mt-4"
            />
            <img 
              src="/background.png"
              alt="Background"
              className="w-full h-full object-cover"
            />
          </>
        </div>
        <div className=' '>

        </div>
      </div>
    </div>
  );
}