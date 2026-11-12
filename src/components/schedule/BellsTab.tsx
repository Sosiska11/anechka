// src/components/schedule/BellsTab.tsx
import React, { useState } from 'react';
import { RotateCcw, Save, CheckCircle2 } from 'lucide-react';
import { BellSlot } from '../../types';
import { DEFAULT_BELLS } from '../../services/storageService';

interface BellsTabProps {
  bells: BellSlot[];
  onSaveBells: (bells: BellSlot[]) => void;
}

export const BellsTab: React.FC<BellsTabProps> = ({ bells, onSaveBells }) => {
  // Копируем в локальный стейт для редактирования
  const [localBells, setLocalBells] = useState<BellSlot[]>(() => {
    // Убеждаемся, что слоты 1–8 есть в списке
    const list = [...bells];
    for (let i = list.length + 1; i <= 8; i++) {
      const def = DEFAULT_BELLS.find((b) => b.lessonNumber === i);
      if (def) list.push({ ...def });
      else list.push({ lessonNumber: i, startTime: '15:20', endTime: '16:05' });
    }
    return list.sort((a, b) => a.lessonNumber - b.lessonNumber);
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleTimeChange = (
    lessonNumber: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    setLocalBells((prev) =>
      prev.map((b) => (b.lessonNumber === lessonNumber ? { ...b, [field]: value } : b))
    );
    setHasChanges(true);
    setSaveSuccess(false);
  };

  const handleSave = () => {
    onSaveBells(localBells);
    setHasChanges(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Сбросить звонки на стандартное школьное расписание (1–8 уроки по 45 мин)?')) {
      setLocalBells(DEFAULT_BELLS);
      onSaveBells(DEFAULT_BELLS);
      setHasChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  // Вычисление длительности урока в минутах
  const calculateDuration = (start: string, end: string): number => {
    if (!start || !end) return 45;
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    return eh * 60 + em - (sh * 60 + sm);
  };

  // Вычисление перемены до следующего урока
  const calculateBreak = (endCurrent: string, startNext: string): number | null => {
    if (!endCurrent || !startNext) return null;
    const [eh, em] = endCurrent.split(':').map(Number);
    const [sh, sm] = startNext.split(':').map(Number);
    const diff = sh * 60 + sm - (eh * 60 + em);
    return diff > 0 ? diff : null;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Расписание звонков (1–8 уроки)
          </h2>
          <p className="text-[11px] text-slate-400">
            Время начала и окончания каждого урока школы
          </p>
        </div>

        <button
          onClick={handleResetToDefault}
          className="flex items-center gap-1 text-[11px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-xl transition-all active:scale-95"
          title="Сбросить на стандартные"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Стандарт</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Расписание звонков успешно сохранено!</span>
        </div>
      )}

      {/* Список звонков 1–8 */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden divide-y divide-slate-100">
        {localBells.map((bell, idx) => {
          const duration = calculateDuration(bell.startTime, bell.endTime);
          const nextBell = localBells[idx + 1];
          const breakDuration = nextBell
            ? calculateBreak(bell.endTime, nextBell.startTime)
            : null;

          return (
            <div key={bell.lessonNumber} className="p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-3">
                {/* Номер урока */}
                <div className="flex items-center gap-2 shrink-0">
                  <span className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-800 font-black text-xs flex items-center justify-center border border-emerald-200">
                    {bell.lessonNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    Урок {bell.lessonNumber}
                  </span>
                </div>

                {/* Поля ввода времени (интерактивные inputs) */}
                <div className="flex items-center gap-1.5">
                  <input
                    type="time"
                    value={bell.startTime}
                    onChange={(e) =>
                      handleTimeChange(bell.lessonNumber, 'startTime', e.target.value)
                    }
                    className="px-2 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 text-center"
                  />
                  <span className="text-slate-300 font-bold">—</span>
                  <input
                    type="time"
                    value={bell.endTime}
                    onChange={(e) =>
                      handleTimeChange(bell.lessonNumber, 'endTime', e.target.value)
                    }
                    className="px-2 py-1.5 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-800 text-center"
                  />
                </div>
              </div>

              {/* Длительность урока и перемена до следующего */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 px-1 pt-0.5">
                <span className="font-medium">Длительность: {duration} мин</span>
                {breakDuration !== null && (
                  <span className="text-emerald-700 font-semibold bg-emerald-50/70 px-2 py-0.5 rounded-md">
                    Перемена: {breakDuration} мин
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Кнопка сохранения звонков */}
      <div className="pt-2">
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`w-full py-3 px-4 rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-95 ${
            hasChanges
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 ring-2 ring-emerald-600/20'
              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
          }`}
        >
          <Save className="w-4 h-4" />
          <span>{hasChanges ? 'Сохранить изменения в звонках' : 'Все звонки сохранены'}</span>
        </button>
      </div>
    </div>
  );
};
