// src/views/ScheduleView.tsx
import React, { useState, useCallback } from 'react';
import { CalendarDays, Clock, Info } from 'lucide-react';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';
import { BellSlot, ScheduleTemplateItem } from '../types';
import { WeeklyTemplateTab } from '../components/schedule/WeeklyTemplateTab';
import { BellsTab } from '../components/schedule/BellsTab';

export const ScheduleView: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'template' | 'bells'>('template');
  const [bells, setBells] = useState<BellSlot[]>(() => storageService.getBells());
  const [template, setTemplate] = useState<ScheduleTemplateItem[]>(() =>
    storageService.getTemplate()
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((cur) => (cur === msg ? null : cur));
    }, 2800);
  };

  const refreshData = useCallback(() => {
    setBells(storageService.getBells());
    setTemplate(storageService.getTemplate());
  }, []);

  // --- Управление слотами шаблона недели ---
  const handleSetSlot = (
    dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6,
    lessonNumber: number,
    className?: string,
    roomOverride?: string
  ) => {
    storageService.setTemplateSlot(dayOfWeek, lessonNumber, className, roomOverride);
    notificationService.scheduleNext7Days();
    refreshData();
    showToast(`Урок ${lessonNumber} успешно сохранён в шаблоне недели`);
  };

  const handleRemoveSlot = (dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6, lessonNumber: number) => {
    storageService.removeTemplateSlot(dayOfWeek, lessonNumber);
    notificationService.scheduleNext7Days();
    refreshData();
    showToast(`Урок ${lessonNumber} удалён из шаблона`);
  };

  // --- Управление звонками ---
  const handleSaveBells = (newBells: BellSlot[]) => {
    storageService.saveBells(newBells);
    notificationService.scheduleNext7Days();
    refreshData();
    showToast('Расписание звонков сохранено');
  };

  const settings = storageService.getSettings();

  return (
    <div className="p-4 pb-24 space-y-4">
      {/* Toast-уведомление */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-11/12 bg-slate-900/95 text-white backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top duration-200">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="flex-1">{toastMessage}</span>
        </div>
      )}

      {/* Заголовок раздела */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">
            Расписание
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {template.length} уроков в шаблоне недели
          </p>
        </div>

        <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200 shadow-2xs">
          Каб. {settings.defaultRoom || '304'}
        </span>
      </div>

      {/* Переключатель 2 подвкладок */}
      <div className="flex bg-slate-200/70 p-1 rounded-2xl">
        <button
          onClick={() => setActiveSubTab('template')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 select-none active:scale-95 ${
            activeSubTab === 'template'
              ? 'bg-white text-emerald-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Шаблон недели</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bells')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 select-none active:scale-95 ${
            activeSubTab === 'bells'
              ? 'bg-white text-emerald-800 shadow-xs'
              : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Звонки</span>
        </button>
      </div>

      {/* Содержимое активной подвкладки */}
      {activeSubTab === 'template' && (
        <WeeklyTemplateTab
          template={template}
          bells={bells}
          defaultRoom={settings.defaultRoom || '304'}
          onSetSlot={handleSetSlot}
          onRemoveSlot={handleRemoveSlot}
        />
      )}

      {activeSubTab === 'bells' && (
        <BellsTab bells={bells} onSaveBells={handleSaveBells} />
      )}
    </div>
  );
};
