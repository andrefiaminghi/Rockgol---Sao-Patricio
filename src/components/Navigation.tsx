import React from 'react';
import { Calendar, Users, Trophy, Swords, ClipboardList, Info } from 'lucide-react';

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
    { id: 'export' as TabType, label: 'Info', icon: Info }
  ];

  return (
    <nav className="shrink-0 z-30 bg-[#0E1726]/95 backdrop-blur-md border-b border-[#1E2D44] shadow-md">
      <div className="grid grid-cols-6 px-1 py-1.5">
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
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-105 stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-full font-medium">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-7 h-0.5 bg-[#238551] rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
