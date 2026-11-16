// src/components/ClassSelector.tsx
import React from 'react';
import { CLASS_GRADES, CLASS_LETTERS, ClassGrade, ClassLetter } from '../types';

interface ClassSelectorProps {
  value: string;
  onChange: (className: string) => void;
}

export const ClassSelector: React.FC<ClassSelectorProps> = ({ value, onChange }) => {
  // Парсим текущее значение (например, "7А" -> 7 и "А")
  const match = value ? value.match(/^(\d+)\s*([А-Яа-я]?)$/) : null;
  const selectedGrade = match ? (parseInt(match[1], 10) as ClassGrade) : null;
  const selectedLetter = match && match[2] ? (match[2].toUpperCase() as ClassLetter) : null;

  const handleGradeClick = (grade: ClassGrade) => {
    const letter = selectedLetter || 'А';
    onChange(`${grade}${letter}`);
  };

  const handleLetterClick = (letter: ClassLetter) => {
    const grade = selectedGrade || 7;
    onChange(`${grade}${letter}`);
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-700">
          Класс
        </label>

        {/* Превью выбранного класса */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400">Выбран:</span>
          <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-0.5 rounded-lg bg-emerald-600 text-white font-bold text-xs">
            {value || '?'}
          </span>
          {value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] text-slate-400 hover:text-rose-600 font-medium ml-1 transition-colors"
            >
              Сбросить
            </button>
          )}
        </div>
      </div>

      {/* Выбор параллели: 5, 6, 7, 8, 9, 10, 11 */}
      <div className="grid grid-cols-7 gap-1">
        {CLASS_GRADES.map((grade) => {
          const isSelected = selectedGrade === grade;
          return (
            <button
              key={grade}
              type="button"
              onClick={() => handleGradeClick(grade)}
              className={`py-1.5 rounded-xl text-xs font-bold border transition-all select-none active:scale-95 ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {grade}
            </button>
          );
        })}
      </div>

      {/* Выбор буквы: А, Б, В, Г, Д, Е */}
      <div className="grid grid-cols-6 gap-1">
        {CLASS_LETTERS.map((letter) => {
          const isSelected = selectedLetter === letter;
          return (
            <button
              key={letter}
              type="button"
              onClick={() => handleLetterClick(letter)}
              className={`py-1.5 rounded-xl text-xs font-bold border transition-all select-none active:scale-95 ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
};

