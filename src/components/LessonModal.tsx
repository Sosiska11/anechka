// src/components/LessonModal.tsx
import React, { useState, useEffect } from 'react';
import {
  X,
  Clock,
  BookOpen,
  FileText,
  ArrowRightLeft,
  Save,
  Microscope,
  FlaskConical,
  FileSpreadsheet,
} from 'lucide-react';
import { DisplayLesson, LessonInstance, LessonType } from '../types';
import { ClassSelector } from './ClassSelector';

interface LessonModalProps {
  lesson: DisplayLesson | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedLesson: LessonInstance) => void;
  onTransferTopic?: (lesson: DisplayLesson) => void;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  lesson,
  isOpen,
  onClose,
  onSave,
  onTransferTopic,
}) => {
  const [className, setClassName] = useState('');
  const [topic, setTopic] = useState('');
  const [lessonType, setLessonType] = useState<LessonType>('regular');
  const [homework, setHomework] = useState('');
  const [notes, setNotes] = useState('');
  const [room, setRoom] = useState('');

  useEffect(() => {
    if (lesson) {
      setClassName(lesson.className || '');
      setTopic(lesson.topic || '');
      setLessonType(lesson.lessonType || 'regular');
      setHomework(lesson.homework || '');
      setNotes(lesson.notes || '');
      setRoom(lesson.room || '');
    }
  }, [lesson]);

  if (!isOpen || !lesson) return null;

  const handleSave = () => {
    const instanceId = lesson.isVirtual
      ? `inst-${lesson.date}-${lesson.lessonNumber}-${Date.now()}`
      : lesson.id;

    const updated: LessonInstance = {
      id: instanceId,
      date: lesson.date,
      lessonNumber: lesson.lessonNumber,
      className: className.trim() || undefined,
      room: room.trim() || lesson.room,
      topic: topic.trim(),
      lessonType,
      homework: homework.trim(),
      notes: notes.trim(),
      status: lesson.status,
      isExtra: lesson.isExtra,
    };

    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Затемнённый фон */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Контейнер шторки / модалки */}
      <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 max-h-[92vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        {/* Полоска перетаскивания для смартфонов */}
        <div className="w-full pt-3 pb-1 flex justify-center sm:hidden">
          <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
        </div>

        {/* Шапка модалки */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="min-w-8 h-8 px-2 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shadow-xs">
              {className || lesson.className || '?'}
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-800 leading-tight">
                {className || lesson.className
                  ? `${className || lesson.className} класс`
                  : 'Класс ?'}{' '}
                • Урок №{lesson.lessonNumber}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>
                  {lesson.startTime} – {lesson.endTime} • {lesson.date}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all active:scale-90"
            aria-label="Закрыть"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Тело формы со скроллом */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Выбор класса (5–11, А–Е) */}
          <div className="p-3 bg-slate-50/80 rounded-2xl border border-slate-200/80">
            <ClassSelector value={className} onChange={setClassName} />
          </div>

          {/* 1. Тип урока */}
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
              ].map((item) => {
                const isSelected = lessonType === item.type;
                return (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => setLessonType(item.type)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs ring-1 ring-emerald-600/30'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Тема урока */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
              <span>Тема урока</span>
              <span className="text-[10px] text-emerald-600 font-semibold">Основное поле</span>
            </label>
            <textarea
              rows={2}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Например: Строение и функции клеточной мембраны..."
              className="w-full px-3.5 py-2.5 text-sm font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all resize-none text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* 3. Домашнее задание */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>Домашнее задание</span>
            </label>
            <input
              type="text"
              value={homework}
              onChange={(e) => setHomework(e.target.value)}
              placeholder="Параграф, вопросы, конспект в тетради..."
              className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* 4. Заметки для себя */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-teal-600" />
              <span>Заметки для себя</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Например: собрать тетради на проверку, подготовить карточки..."
              className="w-full px-3.5 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all resize-none text-slate-800 placeholder-slate-400"
            />
          </div>

          {/* 5. Кабинет */}
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

          {/* 6. Кнопка «Перенести тему на следующий урок» */}
          {onTransferTopic && (
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onTransferTopic({
                    ...lesson,
                    topic: topic.trim(),
                    lessonType,
                    homework: homework.trim(),
                    notes: notes.trim(),
                    room: room.trim() || lesson.room,
                  });
                }}
                disabled={!topic.trim()}
                className={`w-full py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                  topic.trim()
                    ? 'bg-amber-50/70 border-amber-200 text-amber-800 hover:bg-amber-100/80 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-300 cursor-not-allowed'
                }`}
                title="Перенести тему и ДЗ на следующий урок по расписанию"
              >
                <ArrowRightLeft className="w-4 h-4 text-amber-600" />
                <span>Перенести тему на следующий урок</span>
              </button>
            </div>
          )}
        </div>

        {/* Нижняя панель действий */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-2xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-white active:scale-95 transition-all"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <Save className="w-4 h-4" />
            <span>Сохранить</span>
          </button>
        </div>
      </div>
    </div>
  );
};
