// src/components/LessonCard.tsx
import React from 'react';
import {
  Clock,
  MapPin,
  FileText,
  BookOpen,
  ChevronRight,
  Microscope,
  FlaskConical,
  FileSpreadsheet,
} from 'lucide-react';
import { DisplayLesson } from '../types';

interface LessonCardProps {
  lesson: DisplayLesson;
  onClick: () => void;
}

export const LessonCard: React.FC<LessonCardProps> = ({ lesson, onClick }) => {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick();
        }
      }}
      className="relative bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-emerald-400 transition-all duration-150 select-none cursor-pointer active:scale-[0.98] shadow-xs hover:shadow-md"
    >
      {/* Верхняя строка: Номер урока и время звонка */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          {/* Номер урока */}
          <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
            {lesson.lessonNumber}
          </span>

          {/* Время звонка */}
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {lesson.startTime} – {lesson.endTime}
          </span>
        </div>

        <ChevronRight className="w-4 h-4 text-slate-300" />
      </div>

      {/* Основная строка: Класс и кабинет */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Бейдж класса */}
          <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs tracking-tight">
            {lesson.className || '?'}
          </span>

          <span className="text-base font-bold text-slate-800">
            {lesson.className ? `${lesson.className} класс` : 'Класс ?'}
          </span>
        </div>

        {/* Кабинет */}
        <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg shrink-0 flex items-center gap-1">
          <MapPin className="w-3 h-3 text-slate-400" />
          Каб. {lesson.room}
        </span>
      </div>

      {/* Бейдж типа урока (Лабораторная / Практическая / Контрольная) */}
      {lesson.lessonType && lesson.lessonType !== 'regular' && (
        <div className="mt-2 flex items-center gap-2">
          {lesson.lessonType === 'lab' && (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 shadow-xs">
              <Microscope className="w-3.5 h-3.5 text-purple-600" />
              <span>Лабораторная работа</span>
            </span>
          )}
          {lesson.lessonType === 'practical' && (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl bg-sky-50 text-sky-700 border border-sky-200 shadow-xs">
              <FlaskConical className="w-3.5 h-3.5 text-sky-600" />
              <span>Практическая работа</span>
            </span>
          )}
          {lesson.lessonType === 'test' && (
            <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 shadow-xs">
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />
              <span>Контрольная работа</span>
            </span>
          )}
        </div>
      )}

      {/* Тема урока */}
      <div className="mt-2.5 pt-2 border-t border-slate-100">
        {lesson.topic ? (
          <p className="text-sm font-semibold leading-snug text-slate-800">
            {lesson.topic}
          </p>
        ) : (
          <p className="text-xs text-slate-400 font-normal italic py-0.5">
            Записать тему урока...
          </p>
        )}
      </div>

      {/* Иконки ДЗ и заметок */}
      {(lesson.homework || lesson.notes) && (
        <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500 pt-1">
          {lesson.homework && (
            <span className="flex items-center gap-1 text-slate-600 font-medium">
              <BookOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate max-w-[200px]">ДЗ: {lesson.homework}</span>
            </span>
          )}
          {lesson.notes && (
            <span className="flex items-center gap-1 text-slate-500">
              <FileText className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span>Заметка</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
