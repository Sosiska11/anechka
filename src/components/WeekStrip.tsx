// src/components/WeekStrip.tsx
import React from 'react';
import { format, startOfWeek, addDays, isSameDay, isToday, addWeeks, subWeeks } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface WeekStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  showSaturday?: boolean;
}

export const WeekStrip: React.FC<WeekStripProps> = ({
  selectedDate,
  onSelectDate,
  showSaturday = true,
}) => {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const daysCount = showSaturday ? 6 : 5;

  const weekDays = Array.from({ length: daysCount }, (_, i) => addDays(weekStart, i));

  const handlePrevWeek = () => {
    onSelectDate(subWeeks(selectedDate, 1));
  };

  const handleNextWeek = () => {
    onSelectDate(addWeeks(selectedDate, 1));
  };

  const handleGoToday = () => {
    onSelectDate(new Date());
  };

  const isCurrentDayToday = isToday(selectedDate);

  const rawMonth = format(selectedDate, 'LLLL yyyy', { locale: ru });
  const formattedMonth = rawMonth.charAt(0).toUpperCase() + rawMonth.slice(1);

  return (
    <div className="bg-white border-b border-slate-200/80 px-4 pt-4 pb-3 shadow-xs select-none">
      {/* Верхняя строка: Месяц/Год, стрелки недели и кнопка "Сегодня" */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-lg font-bold text-slate-800 tracking-tight">
            {formattedMonth}
          </span>
          <div className="flex items-center ml-1 bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={handlePrevWeek}
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded-md transition-all active:scale-90"
              title="Предыдущая неделя"
              aria-label="Предыдущая неделя"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNextWeek}
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-white rounded-md transition-all active:scale-90"
              title="Следующая неделя"
              aria-label="Следующая неделя"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {!isCurrentDayToday && (
          <button
            onClick={handleGoToday}
            className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200 hover:bg-emerald-100 transition-all active:scale-95 shadow-xs"
          >
            <RotateCcw className="w-3 h-3 text-emerald-600" />
            <span>Сегодня</span>
          </button>
        )}
      </div>

      {/* Горизонтальная лента дней недели */}
      <div className="grid grid-cols-6 gap-1.5 sm:gap-2">
        {weekDays.map((day) => {
          const isSelected = isSameDay(day, selectedDate);
          const dayIsToday = isToday(day);
          const dayNumber = format(day, 'd');
          const dayShortName = format(day, 'EEEEEE', { locale: ru });
          const capitalizedDay = dayShortName.toUpperCase();

          return (
            <button
              key={day.toISOString()}
              onClick={() => onSelectDate(day)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all duration-150 active:scale-95 relative ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-600/20'
                  : dayIsToday
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100/70'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100/90'
              }`}
            >
              <span
                className={`text-[11px] font-semibold tracking-wider ${
                  isSelected ? 'text-emerald-100' : dayIsToday ? 'text-emerald-700' : 'text-slate-400'
                }`}
              >
                {capitalizedDay}
              </span>
              <span className="text-base font-bold mt-0.5 leading-none">
                {dayNumber}
              </span>

              {dayIsToday && !isSelected && (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 absolute bottom-1" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
