// src/App.tsx
import React, { useState, useEffect } from 'react';
import { storageService } from './services/storageService';
import { notificationService } from './services/notificationService';
import { TabType } from './types';
import { Navigation } from './components/Navigation';
import { TodayView } from './views/TodayView';
import { CalendarView } from './views/CalendarView';
import { ScheduleView } from './views/ScheduleView';
import { SettingsView } from './views/SettingsView';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('today');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    // Инициализация дефолтных данных и планировщика локальных уведомлений
    storageService.initStorage();
    notificationService.init().then(() => {
      notificationService.scheduleNext7Days();
    });
  }, []);

  const handleResetData = () => {
    setRefreshKey((prev) => prev + 1);
    setActiveTab('today');
  };

  const handleNavigateToDate = (date: Date) => {
    setSelectedDate(date);
    setActiveTab('today');
  };

  return (
    <div className="min-h-screen bg-slate-100/60 flex justify-center">
      {/* Мобильный каркас приложения (max-w-md mx-auto min-h-screen bg-slate-50) с поддержкой безопасных отступов смартфона */}
      <div
        className="w-full max-w-md min-h-screen bg-slate-50 flex flex-col relative shadow-2xl border-x border-slate-200/50"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <main className="flex-1">
          {activeTab === 'today' && (
            <TodayView
              key={refreshKey}
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          )}
          {activeTab === 'calendar' && (
            <CalendarView onNavigateToDate={handleNavigateToDate} />
          )}
          {activeTab === 'schedule' && <ScheduleView />}
          {activeTab === 'settings' && (
            <SettingsView onResetData={handleResetData} />
          )}
        </main>

        {/* Нижняя панель навигации (4 вкладки) */}
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
};

export default App;
