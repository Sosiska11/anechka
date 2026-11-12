// src/views/CalendarView.tsx
import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks,
  addDays,
} from 'date-fns';
import { ru } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Microscope,
  FileSpreadsheet,
  Coffee,
  ArrowRight,
} from 'lucide-react';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';

interface CalendarViewProps {
  onNavigateToDate: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onNavigateToDate }) => {
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDayDetails, setSelectedDayDetails] = useState<Date | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // --- Навигация ---
  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate((prev) => subMonths(prev, 1));
    } else {
      setCurrentDate((prev) => subWeeks(prev, 1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate((prev) => addMonths(prev, 1));
    } else {
      setCurrentDate((prev) => addWeeks(prev, 1));
    }
  };

  const handleGoToday = () => {
    setCurrentDate(new Date());
  };

  // --- Переключение каникул / выходного дня ---
  const handleToggleHoliday = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    storageService.toggleHoliday(dateStr, 'Каникулы / Выходной');
    notificationService.scheduleNext7Days();
    setRefreshTrigger((prev) => prev + 1);
  };

  // --- Расчёты для режима "Месяц" ---
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const monthDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // --- Расчёты для режима "Неделя" ---
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const showSaturday = storageService.getSettings().showSaturday;
  const weekDaysCount = showSaturday ? 6 : 5;
  const weekDays = Array.from({ length: weekDaysCount }, (_, i) => addDays(weekStart, i));

  // Заголовок текущего периода
  const formattedMonthTitle = format(currentDate, 'LLLL yyyy', { locale: ru });
  const capitalizedTitle =
    formattedMonthTitle.charAt(0).toUpperCase() + formattedMonthTitle.slice(1);

  // Получение информации о дне (уроки, каникулы, индикаторы)
  const getDayInfo = (date: Date) => {
    void refreshTrigger;
    const dateStr = format(date, 'yyyy-MM-dd');
    const { lessons, holiday } = storageService.getLessonsForDate(dateStr);

    const hasHoliday = Boolean(holiday?.isHoliday);
    const totalLessons = lessons.length;
    const withTopic = lessons.filter((l) => l.topic.trim().length > 0).length;
    const hasLab = lessons.some((l) => l.lessonType === 'lab');
    const hasTest = lessons.some((l) => l.lessonType === 'test');
    const hasPractical = lessons.some((l) => l.lessonType === 'practical');

    return {
      lessons,
      holiday,
      hasHoliday,
      totalLessons,
      withTopic,
      hasLab,
      hasTest,
      hasPractical,
    };
  };

  return (
    <div className="p-4 pb-24 space-y-4">
      {/* Шапка календаря с переключателем режима */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">
            Календарь
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Обзор расписания и тем
          </p>
        </div>

        {/* Переключатель вида «Месяц» / «Неделя» */}
        <div className="flex bg-slate-200/80 p-0.5 rounded-xl shadow-inner">
          <button
            onClick={() => setViewMode('month')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'month'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Месяц
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              viewMode === 'week'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Неделя
          </button>
        </div>
      </div>

      {/* Панель навигации по месяцам / неделям */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={handlePrev}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-md transition-all active:scale-90"
              title="Назад"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-white rounded-md transition-all active:scale-90"
              title="Вперёд"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <span className="text-base font-bold text-slate-800">
            {capitalizedTitle}
          </span>
        </div>

        {!isToday(currentDate) && (
          <button
            onClick={handleGoToday}
            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-all active:scale-95"
          >
            <RotateCcw className="w-3 h-3 text-emerald-600" />
            <span>Сегодня</span>
          </button>
        )}
      </div>

      {/* Легенда индикаторов (согласно PLAN.md) */}
      <div className="bg-emerald-50/60 p-2.5 rounded-2xl border border-emerald-100 text-[11px] font-semibold text-slate-600 flex items-center justify-around flex-wrap gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>Все темы</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-500" />
          <span>Часть тем</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-slate-300" />
          <span>Пусто</span>
        </div>
        <div className="flex items-center gap-1 text-purple-700">
          <Microscope className="w-3 h-3" />
          <span>Лаб.</span>
        </div>
        <div className="flex items-center gap-1 text-amber-800">
          <FileSpreadsheet className="w-3 h-3" />
          <span>Контр.</span>
        </div>
      </div>

      {/* РЕЖИМ 1: СЕТКА МЕСЯЦА */}
      {viewMode === 'month' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-3">
          {/* Дни недели ПН–ВС */}
          <div className="grid grid-cols-7 mb-2 text-center text-xs font-bold text-slate-400">
            <span>ПН</span>
            <span>ВТ</span>
            <span>СР</span>
            <span>ЧТ</span>
            <span>ПТ</span>
            <span>СБ</span>
            <span className="text-rose-400">ВС</span>
          </div>

          {/* Сетка ячеек месяца */}
          <div className="grid grid-cols-7 gap-1">
            {monthDays.map((day) => {
              const dayStr = format(day, 'd');
              const isCurrMonth = isSameMonth(day, currentDate);
              const dayIsToday = isToday(day);
              const info = getDayInfo(day);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDayDetails(day)}
                  className={`min-h-[58px] p-1 rounded-2xl flex flex-col items-center justify-between transition-all select-none active:scale-95 border ${
                    info.hasHoliday
                      ? 'bg-rose-50/80 border-rose-200 text-rose-700'
                      : dayIsToday
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 font-bold'
                      : isCurrMonth
                      ? 'bg-slate-50/70 border-slate-100 hover:bg-emerald-50/40 hover:border-emerald-200 text-slate-700'
                      : 'bg-transparent border-transparent text-slate-300'
                  }`}
                >
                  {/* Номер числа */}
                  <span
                    className={`text-xs ${
                      dayIsToday
                        ? 'font-black text-emerald-800'
                        : isCurrMonth
                        ? 'font-semibold'
                        : 'font-normal'
                    }`}
                  >
                    {dayStr}
                  </span>

                  {/* Индикаторы уроков под числом */}
                  <div className="flex flex-col items-center gap-0.5 my-auto">
                    {/* Точка статуса тем уроков */}
                    {!info.hasHoliday && info.totalLessons > 0 && (
                      <div className="flex items-center gap-0.5">
                        {info.withTopic === info.totalLessons ? (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-emerald-500"
                            title="Все темы уроков заполнены"
                          />
                        ) : info.withTopic > 0 ? (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-amber-500"
                            title="Часть тем уроков не заполнена"
                          />
                        ) : (
                          <span
                            className="w-1.5 h-1.5 rounded-full bg-slate-300"
                            title="Темы не заполнены"
                          />
                        )}
                      </div>
                    )}

                    {/* Мини-иконки для лабораторных или контрольных */}
                    {!info.hasHoliday && (
                      <div className="flex items-center gap-0.5">
                        {info.hasLab && (
                          <span title="Запланирована лабораторная работа">
                            <Microscope className="w-3 h-3 text-purple-600 stroke-[2.5]" />
                          </span>
                        )}
                        {info.hasTest && (
                          <span title="Запланирована контрольная работа">
                            <FileSpreadsheet className="w-3 h-3 text-amber-600 stroke-[2.5]" />
                          </span>
                        )}
                      </div>
                    )}

                    {/* Отметка каникул / выходного */}
                    {info.hasHoliday && (
                      <Coffee className="w-3 h-3 text-rose-500" />
                    )}
                  </div>

                  {/* Мини-подпись количества уроков */}
                  {!info.hasHoliday && info.totalLessons > 0 && (
                    <span className="text-[9px] text-slate-400 font-medium">
                      {info.totalLessons} ур.
                    </span>
                  )}
                  {info.hasHoliday && (
                    <span className="text-[8px] font-bold text-rose-500">вых</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* РЕЖИМ 2: СПИСОК НЕДЕЛИ */}
      {viewMode === 'week' && (
        <div className="space-y-3">
          {weekDays.map((day) => {
            const dateTitle = format(day, 'EEEE, d MMMM', { locale: ru });
            const capitalizedDay = dateTitle.charAt(0).toUpperCase() + dateTitle.slice(1);
            const dayIsToday = isToday(day);
            const info = getDayInfo(day);

            return (
              <div
                key={day.toISOString()}
                className={`p-4 rounded-3xl border transition-all shadow-xs ${
                  info.hasHoliday
                    ? 'bg-rose-50/60 border-rose-200'
                    : dayIsToday
                    ? 'bg-white border-emerald-500 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200/80 hover:border-emerald-300'
                }`}
              >
                {/* Заголовок дня недели */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <h3
                      className={`text-sm font-bold ${
                        dayIsToday ? 'text-emerald-800 font-black' : 'text-slate-800'
                      }`}
                    >
                      {capitalizedDay}
                    </h3>
                    {dayIsToday && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                        Сегодня
                      </span>
                    )}
                  </div>

                  {/* Быстрый переключатель каникул */}
                  <button
                    onClick={() => handleToggleHoliday(day)}
                    className={`text-[11px] font-semibold px-2 py-1 rounded-xl transition-all ${
                      info.hasHoliday
                        ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {info.hasHoliday ? 'Каникулы' : 'Рабочий день'}
                  </button>
                </div>

                {/* Если выходной */}
                {info.hasHoliday ? (
                  <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5 py-1">
                    <Coffee className="w-3.5 h-3.5" />
                    <span>Выходной день или каникулы. Уроков нет.</span>
                  </p>
                ) : (
                  <div>
                    {/* Список классов на этот день */}
                    {info.lessons.length > 0 ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {info.lessons.map((lesson) => (
                            <span
                              key={lesson.id}
                              className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-600 text-white shadow-2xs"
                            >
                              <span>{lesson.className || '?'}</span>
                              {lesson.lessonType === 'lab' && (
                                <Microscope className="w-3 h-3 text-white/90" />
                              )}
                              {lesson.lessonType === 'test' && (
                                <FileSpreadsheet className="w-3 h-3 text-white/90" />
                              )}
                            </span>
                          ))}
                        </div>

                        {/* Статус тем */}
                        <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                          <span className="font-medium">
                            Заполнено тем: {info.withTopic} из {info.totalLessons}
                          </span>

                          <button
                            onClick={() => onNavigateToDate(day)}
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-all active:scale-95"
                          >
                            <span>Открыть уроки</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic py-1">
                        В шаблоне недели уроков на этот день нет
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Шторка подробностей дня по клику на дату в сетке месяца */}
      {selectedDayDetails && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setSelectedDayDetails(null)}
          />

          {(() => {
            const dateStr = format(selectedDayDetails, 'yyyy-MM-dd');
            const dayTitle = format(selectedDayDetails, 'EEEE, d MMMM yyyy', { locale: ru });
            const capitalizedDayTitle = dayTitle.charAt(0).toUpperCase() + dayTitle.slice(1);
            const { lessons, holiday } = storageService.getLessonsForDate(dateStr);
            const isHoliday = Boolean(holiday?.isHoliday);

            return (
              <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
                {/* Шапка шторки дня */}
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-800">
                      {capitalizedDayTitle}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">
                      {isHoliday
                        ? 'Отмечен как каникулы / выходной'
                        : `${lessons.length} ${lessons.length === 1 ? 'урок' : lessons.length < 5 ? 'урока' : 'уроков'}`}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedDayDetails(null)}
                    className="p-2 text-slate-400 hover:text-slate-600 rounded-full"
                  >
                    <RotateCcw className="w-4 h-4 rotate-45" />
                  </button>
                </div>

                <div className="p-5 space-y-4 overflow-y-auto">
                  {/* Переключатель Каникулы / Рабочий день */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Каникулы или праздничный день
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Отменяет уроки в этот день в плане
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        handleToggleHoliday(selectedDayDetails);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        isHoliday
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isHoliday ? 'Каникулы (Вкл)' : 'Обычный день'}
                    </button>
                  </div>

                  {/* Список уроков дня */}
                  {!isHoliday && (
                    <div className="space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Уроки на этот день:
                      </p>

                      {lessons.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">
                          На этот день уроков нет
                        </p>
                      ) : (
                        lessons.map((lesson) => (
                          <div
                            key={lesson.id}
                            className="p-3 bg-slate-50/80 rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="min-w-7 h-7 px-1.5 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-2xs">
                                {lesson.className || '?'}
                              </span>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800 truncate">
                                  {lesson.className ? `${lesson.className} класс` : 'Класс ?'}
                                </p>
                                <p className="text-[11px] text-slate-500 truncate">
                                  {lesson.topic || 'Тема не заполнена'}
                                </p>
                              </div>
                            </div>

                            <span className="text-[11px] font-semibold text-slate-400 shrink-0">
                              Урок {lesson.lessonNumber}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Нижняя кнопка перехода к дню на экране Сегодня */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
                  <button
                    onClick={() => {
                      onNavigateToDate(selectedDayDetails);
                      setSelectedDayDetails(null);
                    }}
                    className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <span>Перейти к урокам этого дня</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
