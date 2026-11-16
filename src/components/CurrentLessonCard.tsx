// src/components/CurrentLessonCard.tsx
import React from 'react';
import { isToday } from 'date-fns';
import {
  Clock,
  MapPin,
  CheckCircle2,
  Microscope,
  FlaskConical,
  FileSpreadsheet,
} from 'lucide-react';
import { DisplayLesson } from '../types';

interface CurrentLessonCardProps {
  selectedDate: Date;
  lessons: DisplayLesson[];
  onSelectLesson: (lesson: DisplayLesson) => void;
}

export const CurrentLessonCard: React.FC<CurrentLessonCardProps> = ({
  selectedDate,
  lessons,
  onSelectLesson,
}) => {
  if (!isToday(selectedDate) || lessons.length === 0) {
    return null;
  }

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let activeLesson: DisplayLesson | null = null;
  let lessonState: 'current' | 'next' | 'finished' = 'finished';
  let minutesDiff = 0;

  for (const lesson of lessons) {
    if (lesson.startTime === '--:--' || lesson.endTime === '--:--') continue;

    const [startH, startM] = lesson.startTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;

    const [endH, endM] = lesson.endTime.split(':').map(Number);
    const endMinutes = endH * 60 + endM;

    if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
      activeLesson = lesson;
      lessonState = 'current';
      minutesDiff = endMinutes - currentMinutes;
      break;
    }

    if (currentMinutes < startMinutes) {
      activeLesson = lesson;
      lessonState = 'next';
      minutesDiff = startMinutes - currentMinutes;
      break;
    }
  }

  if (!activeLesson) {
    return (
      <div className="mx-4 mt-3 p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100/90 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
        </div>
        <div className="text-xs">
          <p className="font-bold text-slate-800">Ура уроки на сегодня закончились</p>
          <p className="text-slate-500 mt-0.5">Не забудьте заполнить остальные темы..</p>
        </div>
      </div>
    );
  }

  const isCurrent = lessonState === 'current';

  return (
    <div
      onClick={() => onSelectLesson(activeLesson!)}
      className="mx-4 mt-3 cursor-pointer group active:scale-[0.99] transition-all"
    >
      <div
        className={`p-4 rounded-2xl border transition-all ${
          isCurrent
            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
            : 'bg-white text-slate-800 border-slate-200/80 shadow-xs hover:border-emerald-300'
        }`}
      >
        {/* Верхняя строка статуса и времени */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                isCurrent
                  ? 'bg-emerald-700/70 text-emerald-50'
                  : 'bg-emerald-50 text-emerald-800'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isCurrent ? 'bg-emerald-300 animate-pulse' : 'bg-emerald-500'
                }`}
              />
              {isCurrent
                ? `Идёт сейчас • осталось ${minutesDiff} мин`
                : `Следующий урок • через ${minutesDiff} мин`}
            </span>
          </div>

          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              isCurrent ? 'text-emerald-100' : 'text-slate-400'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>
              {activeLesson.startTime} – {activeLesson.endTime}
            </span>
          </div>
        </div>

        {/* Предмет и кабинет */}
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-black px-2 py-0.5 rounded-lg flex items-center justify-center tracking-tight ${
                  isCurrent ? 'bg-white text-emerald-800 shadow-xs' : 'bg-emerald-600 text-white'
                }`}
              >
                {activeLesson.className || '?'}
              </span>
              <h3
                className={`text-base font-bold tracking-tight truncate ${
                  isCurrent ? 'text-white' : 'text-slate-800'
                }`}
              >
                {activeLesson.className ? `${activeLesson.className} класс` : 'Класс ?'}
              </h3>
            </div>

            {/* Тип урока */}
            {activeLesson.lessonType !== 'regular' && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <span
                  className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-lg ${
                    isCurrent
                      ? 'bg-white/20 text-white'
                      : 'bg-purple-50 text-purple-700 border border-purple-200/60'
                  }`}
                >
                  {activeLesson.lessonType === 'lab' && <Microscope className="w-3 h-3" />}
                  {activeLesson.lessonType === 'practical' && <FlaskConical className="w-3 h-3" />}
                  {activeLesson.lessonType === 'test' && <FileSpreadsheet className="w-3 h-3" />}
                  {activeLesson.lessonType === 'lab'
                    ? 'Лабораторная'
                    : activeLesson.lessonType === 'practical'
                    ? 'Практическая'
                    : 'Контрольная'}
                </span>
              </div>
            )}

            {/* Тема урока */}
            <p
              className={`text-xs mt-2 line-clamp-1 ${
                activeLesson.topic
                  ? isCurrent
                    ? 'text-emerald-50 font-medium'
                    : 'text-slate-700 font-medium'
                  : isCurrent
                  ? 'text-emerald-200/80 italic'
                  : 'text-slate-400 italic'
              }`}
            >
              {activeLesson.topic || 'Записать тему урока...'}
            </p>
          </div>

          {/* Кабинет и номер урока */}
          <div className="flex flex-col items-end shrink-0 pl-2">
            <span
              className={`text-xs font-medium px-2 py-1 rounded-lg flex items-center gap-1 ${
                isCurrent ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <MapPin className="w-3 h-3 opacity-80" />
              Каб. {activeLesson.room}
            </span>
            <span
              className={`text-[11px] mt-1 font-medium ${
                isCurrent ? 'text-emerald-100' : 'text-slate-400'
              }`}
            >
              Урок №{activeLesson.lessonNumber}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
