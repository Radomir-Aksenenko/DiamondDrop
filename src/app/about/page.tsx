'use client';

import React from 'react';
import Image from 'next/image';

interface TeamMember {
  name: string;
  imageUrl: string;
  role: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "fupir",
    imageUrl: "https://starlightskins.lunareclipse.studio/render/marching/fupir/full",
    role: "Дизайнер"
  },
  {
    name: "rafael1209", 
    imageUrl: "https://starlightskins.lunareclipse.studio/render/pointing/rafael1209/full",
    role: "Тим-лид, бэкэнд"
  },
  {
    name: "megatntmega",
    imageUrl: "https://starlightskins.lunareclipse.studio/render/default/megatntmega/full", 
    role: "Фронтенд"
  }
];

/**
 * Компонент карточки участника команды
 */
function TeamMemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="flex flex-col items-center">
      {/* Изображение участника */}
      <div className="mb-3 w-[150px] h-[225px] flex items-center justify-center">
        <Image 
          src={member.imageUrl} 
          alt={member.name} 
          width={150}
          height={225}
          className="object-contain w-full h-full" 
        />
      </div>
      
      {/* Имя участника */}
      <h3 className="text-[#F9F8FC] font-actay font-bold text-base mb-2 text-center">
        {member.name}
      </h3>
      
      {/* Роль участника с отдельной подложкой */}
      <div className="flex px-3 py-1.5 justify-center items-center gap-1 rounded-[100px] bg-[#6563EE]/10">
        <span className="text-[#5C5ADC] font-actay text-sm font-bold">{member.role}</span>
      </div>
    </div>
  );
}

export default function AboutPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 pt-8">
      {/* Заголовок страницы */}
      <div className="text-center mb-12">
        <h1 className="text-[24px] font-[500] text-white text-center font-unbounded">
          Наша команда
        </h1>
      </div>
      
      {/* Сетка участников команды */}
      <div className="grid grid-cols-3 gap-x-2 gap-y-4 justify-items-center">
        {teamMembers.map((member, index) => (
          <div 
            key={member.name}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <TeamMemberCard member={member} />
          </div>
        ))}
      </div>
    </div>
  );
}