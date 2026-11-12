// src/components/AddLessonModal.tsx
import React, { useState } from 'react';
import { X, Plus, Microscope, FlaskConical, FileSpreadsheet, BookOpen } from 'lucide-react';
import { BellSlot, LessonInstance, LessonType } from '../types';
import { ClassSelector } from './ClassSelector';

interface AddLessonModalProps {
  isOpen: boolean;
  dateStr: string;
  bells: BellSlot[];
  defaultRoom: string;
  onClose: () => void;
  onAdd: (newLesson: LessonInstance) => void;
}

export const AddLessonModal: React.FC<AddLessonModalProps> = ({
  isOpen,
  dateStr,
  bells,
  defaultRoom,
  onClose,
  onAdd,
}) => {
  const [className, setClassName] = useState('7А');
  const [lessonNumber, setLessonNumber] = useState<number>(1);
  const [lessonType, setLessonType] = useState<LessonType>('regular');
  const [topic, setTopic] = useState('');
  const [homework, setHomework] = useState('');
  const [room, setRoom] = useState(defaultRoom || '304');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newLesson: LessonInstance = {
      id: `extra-${dateStr}-${lessonNumber}-${Date.now()}`,
      date: dateStr,
      lessonNumber,
      className: className.trim() || undefined,
      room: room.trim() || defaultRoom || '304',
      topic: topic.trim(),
      lessonType,
      homework: homework.trim(),
      notes: 'Дополнительный урок / замена',
      status: 'planned',
      isExtra: true,
    };

    onAdd(newLesson);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="min-w-8 h-8 px-2 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
              {className || '?'}
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-800">
                {className ? `${className} класс` : 'Добавить урок'}
              </h2>
              <p className="text-xs text-slate-400 font-medium">Дата: {dateStr}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-all active:scale-90"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {/* Выбор класса (5–11, А–Е) */}
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80">
            <ClassSelector value={className} onChange={setClassName} />
          </div>

          {/* Номер урока */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Номер урока
            </label>
            <div className="grid grid-cols-8 gap-1.5">
              {bells.map((bell) => (
                <button
                  key={bell.lessonNumber}
                  type="button"
                  onClick={() => setLessonNumber(bell.lessonNumber)}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                    lessonNumber === bell.lessonNumber
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {bell.lessonNumber}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              Время звонка: {bells.find((b) => b.lessonNumber === lessonNumber)?.startTime} –{' '}
              {bells.find((b) => b.lessonNumber === lessonNumber)?.endTime}
            </p>
          </div>

          {/* Тип урока */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Тип урока
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { type: 'regular' as LessonType, label: 'Обычный урок', icon: null },
                {
                  type: 'lab' as LessonType,
                  label: 'Лабораторная',
                  icon: <Microscope className="w-3.5 h-3.5 text-purple-600" />,
                },
                {
                  type: 'practical' as LessonType,
                  label: 'Практическая',
                  icon: <FlaskConical className="w-3.5 h-3.5 text-sky-600" />,
                },
                {
                  type: 'test' as LessonType,
                  label: 'Контрольная',
                  icon: <FileSpreadsheet className="w-3.5 h-3.5 text-amber-600" />,
                },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setLessonType(item.type)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                    lessonType === item.type
                      ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs ring-1 ring-emerald-600/30'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Тема урока */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Тема урока
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Введите тему урока..."
              className="w-full px-3.5 py-2.5 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Домашнее задание */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>Домашнее задание</span>
            </label>
            <input
              type="text"
              value={homework}
              onChange={(e) => setHomework(e.target.value)}
              placeholder="Параграф, упражнения..."
              className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* Кабинет */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Кабинет
            </label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value)}
              placeholder="304"
              className="w-full px-3.5 py-2 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить в расписание дня</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
