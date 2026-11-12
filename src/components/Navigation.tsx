// src/components/Navigation.tsx
import React from 'react';
import { CalendarDays, CalendarRange, Clock, Settings2 } from 'lucide-react';
import { TabType } from '../types';

interface NavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    {
      id: 'today' as TabType,
      label: 'Сегодня',
      icon: Clock,
    },
    {
      id: 'calendar' as TabType,
      label: 'Календарь',
      icon: CalendarRange,
    },
    {
      id: 'schedule' as TabType,
      label: 'Расписание',
      icon: CalendarDays,
    },
    {
      id: 'settings' as TabType,
      label: 'Настройки',
      icon: Settings2,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg"
      style={{ paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <div className="max-w-md mx-auto px-3 pt-1.5 flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all duration-200 select-none active:scale-95 ${
                isActive
                  ? 'text-emerald-700 font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/50' : ''
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-2'}`} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
