// src/views/TodayView.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  Plus,
  Coffee,
  Info,
  Layers,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';
import { DisplayLesson, LessonInstance, DayOverride } from '../types';
import { WeekStrip } from '../components/WeekStrip';
import { CurrentLessonCard } from '../components/CurrentLessonCard';
import { LessonCard } from '../components/LessonCard';
import { LessonModal } from '../components/LessonModal';
import { AddLessonModal } from '../components/AddLessonModal';

interface TodayViewProps {
  selectedDate?: Date;
  onSelectDate?: (date: Date) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  selectedDate: propSelectedDate,
  onSelectDate: propOnSelectDate,
}) => {
  const [internalDate, setInternalDate] = useState<Date>(new Date());
  const selectedDate = propSelectedDate ?? internalDate;
  const setSelectedDate = propOnSelectDate ?? setInternalDate;

  const [lessons, setLessons] = useState<DisplayLesson[]>([]);
  const [holiday, setHoliday] = useState<DayOverride | undefined>(undefined);
  const [editingLesson, setEditingLesson] = useState<DisplayLesson | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  const loadLessons = useCallback(() => {
    const { lessons: loadedLessons, holiday: loadedHoliday } =
      storageService.getLessonsForDate(dateStr);
    setLessons(loadedLessons);
    setHoliday(loadedHoliday);
  }, [dateStr]);

  useEffect(() => {
    loadLessons();
  }, [loadLessons]);

  // Сохранение урока из модалки
  const handleSaveLesson = (updatedLesson: LessonInstance) => {
    storageService.saveLesson(updatedLesson);
    notificationService.scheduleNext7Days();
    loadLessons();
    showToast('Урок успешно сохранён');
  };

  // Перенос темы на следующий урок
  const handleTransferTopic = (lesson: DisplayLesson) => {
    const result = storageService.transferTopicToNextLesson(lesson);
    if (result.success) {
      notificationService.scheduleNext7Days();
      loadLessons();
      setEditingLesson(null);
      showToast(result.message);
    } else {
      showToast(result.message);
    }
  };

  // Добавление разового / доп. урока
  const handleAddLesson = (newLesson: LessonInstance) => {
    storageService.saveLesson(newLesson);
    notificationService.scheduleNext7Days();
    loadLessons();
    showToast('Дополнительный урок добавлен');
  };

  const bells = storageService.getBells();
  const settings = storageService.getSettings();

  const fullDateTitle = format(selectedDate, 'EEEE, d MMMM', { locale: ru });
  const capitalizedDateTitle =
    fullDateTitle.charAt(0).toUpperCase() + fullDateTitle.slice(1);

  const withTopicCount = lessons.filter((l) => l.topic.trim().length > 0).length;

  return (
    <div className="pb-24">
      {/* Всплывающее уведомление (Toast) */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-sm w-11/12 bg-slate-900/95 text-white backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top duration-200">
          <Info className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="flex-1">{toastMessage}</span>
        </div>
      )}

      {/* Верхняя лента дней недели */}
      <WeekStrip
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        showSaturday={settings.showSaturday}
      />

      {/* Виджет текущего/ближайшего урока биологии */}
      <CurrentLessonCard
        selectedDate={selectedDate}
        lessons={lessons}
        onSelectLesson={(lesson) => setEditingLesson(lesson)}
      />

      {/* Заголовок выбранного дня и кнопка добавления */}
      <div className="px-4 mt-4 flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-black text-slate-800 tracking-tight">
            {capitalizedDateTitle}
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            {lessons.length > 0
              ? `${lessons.length} ${
                  lessons.length === 1
                    ? 'урок'
                    : lessons.length < 5
                    ? 'урока'
                    : 'уроков'
                } • Заполнено тем: ${withTopicCount}/${lessons.length}`
              : 'Уроков на этот день нет'}
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-sm shadow-emerald-600/30 transition-all shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Добавить урок</span>
        </button>
      </div>

      {/* Выходной день / праздник */}
      {holiday && holiday.isHoliday && (
        <div className="mx-4 mt-4 p-6 bg-white rounded-3xl border border-slate-200/80 text-center shadow-xs">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100/80 text-amber-600 flex items-center justify-center mb-3">
            <Coffee className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-800">
            {holiday.label || 'Выходной день'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            В этот день уроков нет. Отдыхаем! ☕
          </p>
        </div>
      )}

      {/* Список уроков дня */}
      {!holiday?.isHoliday && (
        <div className="px-4 mt-3">
          {lessons.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 text-center shadow-xs mt-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">Уроков нет</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                В шаблоне расписания на этот день уроки не назначены. Вы можете добавить замену кнопкой выше.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {lessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  onClick={() => setEditingLesson(lesson)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Модальное окно редактирования урока */}
      <LessonModal
        lesson={editingLesson}
        isOpen={Boolean(editingLesson)}
        onClose={() => setEditingLesson(null)}
        onSave={handleSaveLesson}
        onTransferTopic={handleTransferTopic}
      />

      {/* Модальное окно добавления разового урока */}
      <AddLessonModal
        isOpen={isAddModalOpen}
        dateStr={dateStr}
        bells={bells}
        defaultRoom={settings.defaultRoom || '304'}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddLesson}
      />
    </div>
  );
};
