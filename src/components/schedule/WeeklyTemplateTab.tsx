// src/components/schedule/WeeklyTemplateTab.tsx
import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { BellSlot, ScheduleTemplateItem } from '../../types';

interface WeeklyTemplateTabProps {
  template: ScheduleTemplateItem[];
  bells: BellSlot[];
  defaultRoom: string;
  onSetSlot: (
    dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6,
    lessonNumber: number,
    roomOverride?: string
  ) => void;
  onRemoveSlot: (dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6, lessonNumber: number) => void;
}

const DAYS_OF_WEEK: Array<{ id: 1 | 2 | 3 | 4 | 5 | 6; label: string; short: string }> = [
  { id: 1, label: 'Понедельник', short: 'ПН' },
  { id: 2, label: 'Вторник', short: 'ВТ' },
  { id: 3, label: 'Среда', short: 'СР' },
  { id: 4, label: 'Четверг', short: 'ЧТ' },
  { id: 5, label: 'Пятница', short: 'ПТ' },
  { id: 6, label: 'Суббота', short: 'СБ' },
];

export const WeeklyTemplateTab: React.FC<WeeklyTemplateTabProps> = ({
  template,
  bells,
  defaultRoom,
  onSetSlot,
  onRemoveSlot,
}) => {
  const [selectedDay, setSelectedDay] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [editingSlotNumber, setEditingSlotNumber] = useState<number | null>(null);
  const [roomOverride, setRoomOverride] = useState<string>('');

  const dayItems = template.filter((t) => t.dayOfWeek === selectedDay);
  const itemMap = new Map<number, ScheduleTemplateItem>(
    dayItems.map((item) => [item.lessonNumber, item])
  );
  const bellMap = new Map<number, BellSlot>(bells.map((b) => [b.lessonNumber, b]));

  const openSlotEditor = (lessonNumber: number) => {
    const existing = itemMap.get(lessonNumber);
    setEditingSlotNumber(lessonNumber);
    setRoomOverride(existing?.roomOverride || '');
  };

  const handleSaveSlot = () => {
    if (editingSlotNumber !== null) {
      onSetSlot(
        selectedDay,
        editingSlotNumber,
        roomOverride.trim() ? roomOverride.trim() : undefined
      );
      setEditingSlotNumber(null);
    }
  };

  const handleClearSlot = (lessonNumber: number) => {
    onRemoveSlot(selectedDay, lessonNumber);
    if (editingSlotNumber === lessonNumber) {
      setEditingSlotNumber(null);
    }
  };

  const slotNumbers = [1, 2, 3, 4, 5, 6, 7, 8];

  return (
    <div className="space-y-4">
      {/* Селектор дня недели Пн–Сб */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="grid grid-cols-6 gap-1">
          {DAYS_OF_WEEK.map((day) => {
            const isSelected = selectedDay === day.id;
            const countForDay = template.filter((t) => t.dayOfWeek === day.id).length;

            return (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={`py-2 px-1 rounded-xl text-center flex flex-col items-center transition-all select-none active:scale-95 ${
                  isSelected
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/25 ring-2 ring-emerald-600/20'
                    : 'text-slate-600 hover:bg-slate-100 font-semibold'
                }`}
              >
                <span className="text-xs tracking-wider">{day.short}</span>
                <span
                  className={`text-[10px] mt-0.5 px-1.5 rounded-full ${
                    isSelected
                      ? 'bg-emerald-700/80 text-white'
                      : countForDay > 0
                      ? 'bg-emerald-50 text-emerald-800'
                      : 'text-slate-400'
                  }`}
                >
                  {countForDay} ур.
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Список слотов 1–8 уроков на выбранный день */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold text-slate-700">
            {DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.label} • Расписание уроков
          </p>
          <span className="text-[11px] text-slate-400">
            {dayItems.length} из 8 слотов занято
          </span>
        </div>

        {slotNumbers.map((num) => {
          const tmplItem = itemMap.get(num);
          const bell = bellMap.get(num);
          const timeStr = bell ? `${bell.startTime} – ${bell.endTime}` : '--:--';
          const room = tmplItem?.roomOverride || defaultRoom || '304';

          if (tmplItem) {
            return (
              <div
                key={num}
                className="bg-white rounded-2xl p-3.5 border border-slate-200/80 shadow-xs flex items-center justify-between gap-3 hover:border-emerald-300 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Номер урока */}
                  <div className="flex flex-col items-center justify-center w-7 shrink-0">
                    <span className="text-sm font-black text-slate-700 leading-none">
                      {num}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium mt-0.5">урок</span>
                  </div>

                  {/* Знак «?» вместо класса */}
                  <span className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                    ?
                  </span>

                  {/* Заголовок «Класс ?» и время */}
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-slate-800">
                      Класс ?
                    </span>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {timeStr}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        Каб. {room}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Кнопки управления слотом */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openSlotEditor(num)}
                    className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all active:scale-90"
                    title="Изменить кабинет"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleClearSlot(num)}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                    title="Удалить урок из слота"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          }

          // Пустой слот
          return (
            <button
              key={num}
              onClick={() => openSlotEditor(num)}
              className="w-full bg-slate-50/70 hover:bg-emerald-50/50 hover:border-emerald-300 border border-dashed border-slate-300/80 rounded-2xl p-3 flex items-center justify-between text-left transition-all active:scale-[0.99] group"
            >
              <div className="flex items-center gap-3">
                <div className="w-7 text-center">
                  <span className="text-xs font-bold text-slate-400 group-hover:text-emerald-700">
                    {num}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500 group-hover:text-emerald-800 font-semibold">
                  <Plus className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                  <span>Добавить урок в слот №{num}</span>
                </div>
              </div>

              <span className="text-[11px] text-slate-400 font-medium">
                {timeStr}
              </span>
            </button>
          );
        })}
      </div>

      {/* Модальное окно настройки слота */}
      {editingSlotNumber !== null && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setEditingSlotNumber(null)}
          />

          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  {DAYS_OF_WEEK.find((d) => d.id === selectedDay)?.label} • Слот №{editingSlotNumber}
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Время: {bellMap.get(editingSlotNumber)?.startTime} – {bellMap.get(editingSlotNumber)?.endTime}
                </p>
              </div>

              <button
                onClick={() => setEditingSlotNumber(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-all active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  ?
                </span>
                <div>
                  <p className="text-sm font-bold text-emerald-950">Класс ?</p>
                  <p className="text-xs text-emerald-700/80">Постоянный еженедельный урок</p>
                </div>
              </div>

              {/* Кабинет */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center justify-between">
                  <span>Кабинет</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    по умолчанию: {defaultRoom || '304'}
                  </span>
                </label>
                <input
                  type="text"
                  value={roomOverride}
                  onChange={(e) => setRoomOverride(e.target.value)}
                  placeholder={`Оставьте пустым для каб. ${defaultRoom || '304'}`}
                  className="w-full px-3.5 py-2.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                />
              </div>

              {/* Кнопка очистки слота, если уже был назначен */}
              {itemMap.has(editingSlotNumber) && (
                <button
                  type="button"
                  onClick={() => handleClearSlot(editingSlotNumber)}
                  className="w-full py-2.5 px-3 rounded-xl border border-rose-200 text-rose-700 bg-rose-50/60 hover:bg-rose-100 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Удалить урок из этого слота</span>
                </button>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setEditingSlotNumber(null)}
                className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-white active:scale-95 transition-all"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={handleSaveSlot}
                className="flex-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Сохранить в шаблон</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
