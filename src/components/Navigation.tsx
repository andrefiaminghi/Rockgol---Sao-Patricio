import React from 'react';
import { Calendar, Users, Trophy, Swords, ClipboardList, Download } from 'lucide-react';

export type TabType = 'matches' | 'teams' | 'standings' | 'knockout' | 'scoresheet' | 'export';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'matches' as TabType, label: 'Jogos', icon: Calendar },
    { id: 'teams' as TabType, label: 'Times', icon: Users },
    { id: 'standings' as TabType, label: 'Classificação', icon: Trophy },
    { id: 'knockout' as TabType, label: 'Mata-Mata', icon: Swords },
    { id: 'scoresheet' as TabType, label: 'Súmula', icon: ClipboardList },
    { id: 'export' as TabType, label: 'Exportar', icon: Download }
  ];

  return (
    <nav className="shrink-0 z-40 bg-[#1C2127]/95 backdrop-blur-md border-t border-[#2F343C] pb-safe-nav shadow-2xl">
      <div className="grid grid-cols-6 px-1 pt-2 pb-1">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all duration-150 relative ${
                isActive
                  ? 'text-[#29A634] font-bold'
                  : 'text-[#8F99A8] hover:text-[#D3D8DE]'
              }`}
            >
              {isActive && (
                <span className="absolute -top-2 w-7 h-0.5 bg-[#238551] rounded-full" />
              )}
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-105 stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] mt-1 tracking-tight truncate max-w-full font-medium">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
