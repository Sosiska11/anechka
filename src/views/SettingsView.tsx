// src/views/SettingsView.tsx
import React, { useState, useRef } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  Download,
  Upload,
  Copy,
  Check,
  DoorOpen,
  Bell,
  Calendar,
  AlertCircle,
  X,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { storageService } from '../services/storageService';
import { notificationService } from '../services/notificationService';
import { AppSettings } from '../types';

interface SettingsViewProps {
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onResetData }) => {
  const [settings, setSettings] = useState<AppSettings>(() => storageService.getSettings());
  const [defaultRoom, setDefaultRoom] = useState(settings.defaultRoom || '304');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
  const [pasteBackupText, setPasteBackupText] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3200);
  };

  // Сохранение настроек кабинета
  const handleSaveRoom = (val: string) => {
    const updatedRoom = val.trim() || '304';
    setDefaultRoom(updatedRoom);
    const updated: AppSettings = {
      ...settings,
      defaultRoom: updatedRoom,
    };
    storageService.saveSettings(updated);
    setSettings(updated);
    notificationService.scheduleNext7Days();
    showNotification(`Кабинет ${updatedRoom} установлен по умолчанию`);
  };

  // Переключение 6-дневной учебной недели (суббота)
  const handleToggleSaturday = () => {
    const updated: AppSettings = {
      ...settings,
      showSaturday: !settings.showSaturday,
    };
    storageService.saveSettings(updated);
    setSettings(updated);
    notificationService.scheduleNext7Days();
    showNotification(
      updated.showSaturday ? 'Суббота включена в расписание' : 'Суббота скрыта'
    );
  };

  // Переключатель «Напоминать перед уроком»
  const handleToggleLessonReminder = () => {
    const isCurrentlyOn = settings.reminderMinutesBefore !== null;
    const newMinutes = isCurrentlyOn ? null : 10;
    const updated: AppSettings = {
      ...settings,
      reminderMinutesBefore: newMinutes,
    };
    storageService.saveSettings(updated);
    setSettings(updated);
    notificationService.scheduleNext7Days();
    showNotification(
      newMinutes === null
        ? 'Напоминания перед уроками выключены'
        : `Напоминание включено (за ${newMinutes} мин до звонка)`
    );
  };

  // Выбор времени напоминания перед уроком (5, 10 или 15 мин)
  const handleSetReminderMinutes = (mins: number) => {
    const updated: AppSettings = {
      ...settings,
      reminderMinutesBefore: mins,
    };
    storageService.saveSettings(updated);
    setSettings(updated);
    notificationService.scheduleNext7Days();
    showNotification(`Напоминание установлено за ${mins} минут до звонка`);
  };

  // Переключатель «Вечернее напоминание в 19:00»
  const handleToggleEveningReminder = () => {
    const isCurrentlyOn = Boolean(settings.eveningReminderTime);
    const newTime = isCurrentlyOn ? null : '19:00';
    const updated: AppSettings = {
      ...settings,
      eveningReminderTime: newTime,
    };
    storageService.saveSettings(updated);
    setSettings(updated);
    notificationService.scheduleNext7Days();
    showNotification(
      newTime === null
        ? 'Вечернее напоминание выключено'
        : 'Вечернее напоминание в 19:00 включено'
    );
  };

  // --- Резервное копирование: «Сохранить копию» (.json) ---
  const handleSaveBackupFile = () => {
    try {
      const jsonStr = storageService.exportBackup();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const filename = `biology-backup-${format(new Date(), 'yyyy-MM-dd')}.json`;
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showNotification(`Копия сохранена: ${filename}`);
    } catch {
      showNotification('Не удалось сохранить файл резервной копии', 'error');
    }
  };

  // --- Копирование текста JSON в буфер (для Telegram / заметок) ---
  const handleCopyBackupCode = async () => {
    try {
      const jsonStr = storageService.exportBackup();
      await navigator.clipboard.writeText(jsonStr);
      setIsCopied(true);
      showNotification('Код копии скопирован! Можно вставить в Telegram / заметки');
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // Fallback
      showNotification('Код копии сформирован, используйте файл', 'error');
    }
  };

  // --- Восстановление из выбранного .json файла ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      processRestoreJson(content);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  // --- Восстановление из вставленного текста ---
  const handleRestoreFromText = () => {
    if (!pasteBackupText.trim()) {
      showNotification('Вставьте текст резервной копии в поле ввода', 'error');
      return;
    }
    processRestoreJson(pasteBackupText.trim());
  };

  const processRestoreJson = (jsonString: string) => {
    const result = storageService.importBackup(jsonString);
    if (result.success) {
      const newSettings = storageService.getSettings();
      setSettings(newSettings);
      setDefaultRoom(newSettings.defaultRoom || '304');
      notificationService.scheduleNext7Days();
      onResetData();
      setIsRestoreModalOpen(false);
      setPasteBackupText('');
      showNotification('Данные успешно восстановлены из резервной копии!');
    } else {
      showNotification(result.message, 'error');
    }
  };

  // Сброс и перезагрузка демо-данных
  const handleReset = () => {
    if (
      window.confirm(
        'Сбросить все текущие изменения и перезагрузить стандартные демо-данные?'
      )
    ) {
      storageService.resetToDemoData();
      const newSettings = storageService.getSettings();
      setSettings(newSettings);
      setDefaultRoom(newSettings.defaultRoom || '304');
      notificationService.scheduleNext7Days();
      onResetData();
      showNotification('Демо-данные успешно загружены!');
    }
  };

  const isLessonReminderOn = settings.reminderMinutesBefore !== null;
  const isEveningReminderOn = Boolean(settings.eveningReminderTime);

  return (
    <div className="p-4 pb-28 space-y-4">
      {/* Заголовок страницы */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-800 tracking-tight">
            Настройки
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Параметры планера
          </p>
        </div>

        <span className="text-xs font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-full border border-emerald-200">
          Каб. {defaultRoom}
        </span>
      </div>

      {/* Всплывающее уведомление */}
      {message && (
        <div
          className={`p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            message.type === 'error'
              ? 'bg-rose-50 border border-rose-200 text-rose-800'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-800'
          }`}
        >
          {message.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Кабинет по умолчанию */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <h2 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <DoorOpen className="w-3.5 h-3.5 text-emerald-600" />
          <span>Кабинет по умолчанию</span>
        </h2>

        <p className="text-xs text-slate-500 leading-relaxed">
          Этот номер кабинета подставляется в уроки по умолчанию:
        </p>

        <div className="flex items-center gap-3 pt-1">
          <input
            type="text"
            value={defaultRoom}
            onChange={(e) => setDefaultRoom(e.target.value)}
            onBlur={(e) => handleSaveRoom(e.target.value)}
            placeholder="304"
            className="w-32 px-3.5 py-2.5 text-base font-bold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-center text-slate-800"
          />
          <button
            onClick={() => handleSaveRoom(defaultRoom)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
          >
            Сохранить
          </button>
        </div>
      </div>

      {/* Учебная неделя */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <h2 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          <span>Учебная неделя</span>
        </h2>

        <div className="flex items-center justify-between pt-1">
          <div>
            <p className="text-sm font-bold text-slate-800">Показывать субботу</p>
            <p className="text-xs text-slate-400">
              6-дневная учебная неделя в расписании
            </p>
          </div>
          <button
            onClick={handleToggleSaturday}
            className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out ${
              settings.showSaturday ? 'bg-emerald-600' : 'bg-slate-200'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                settings.showSaturday ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Напоминания */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
          <Bell className="w-3.5 h-3.5 text-emerald-600" />
          <span>Напоминания</span>
        </h2>

        {/* Переключатель: Напоминать перед уроком */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800">Напоминать перед уроком</p>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                Время, кабинет и тема урока
              </p>
            </div>
            <button
              onClick={handleToggleLessonReminder}
              className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ml-3 ${
                isLessonReminderOn ? 'bg-emerald-600' : 'bg-slate-200'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                  isLessonReminderOn ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Выбор времени (5, 10 или 15 мин) при включённом напоминании */}
          {isLessonReminderOn && (
            <div className="pt-1.5">
              <p className="text-xs font-medium text-slate-600 mb-1.5">
                За сколько минут до звонка уведомлять:
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[5, 10, 15].map((mins) => {
                  const isSelected = settings.reminderMinutesBefore === mins;
                  return (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => handleSetReminderMinutes(mins)}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                        isSelected
                          ? 'bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      За {mins} мин
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Переключатель: Вечернее напоминание в 19:00 */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-slate-800">Вечернее напоминание в 19:00</p>
            <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
              Напомнит проверить расписание и темы на завтра
            </p>
          </div>
          <button
            onClick={handleToggleEveningReminder}
            className={`w-12 h-7 rounded-full p-1 transition-colors duration-200 ease-in-out shrink-0 ml-3 ${
              isEveningReminderOn ? 'bg-emerald-600' : 'bg-slate-200'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                isEveningReminderOn ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Тестовое напоминание */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={async () => {
              if (notificationService.isNative()) {
                const ok = await notificationService.sendTestNotification();
                if (ok) {
                  showNotification('Тестовое напоминание сработает через 3 сек (сверните приложение)');
                } else {
                  showNotification('Разрешение на уведомления не предоставлено', 'error');
                }
              } else {
                showNotification('Напоминания работают на смартфоне в приложении Android');
              }
            }}
            className="w-full py-2.5 px-3 rounded-xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <Bell className="w-3.5 h-3.5 text-emerald-600" />
            <span>Проверить напоминание (тест через 3 сек)</span>
          </button>
        </div>
      </div>

      {/* Резервные копии */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3.5">
        <h2 className="text-xs font-bold text-slate-700 flex items-center justify-between">
          <span>Резервная копия</span>
        </h2>

        <p className="text-xs text-slate-500 leading-relaxed">
          Сохраните файл со всеми уроками и темами на устройство или скопируйте текст в Telegram / заметки:
        </p>

        {/* Скрытый input для выбора файла .json */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".json,application/json"
          className="hidden"
        />

        {/* Основные две кнопки: «Сохранить копию» и «Восстановить из файла» */}
        <div className="grid grid-cols-2 gap-2 text-xs font-bold">
          <button
            onClick={handleSaveBackupFile}
            className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md shadow-emerald-600/25"
          >
            <Download className="w-4 h-4" />
            <span>Сохранить копию</span>
          </button>

          <button
            onClick={() => setIsRestoreModalOpen(true)}
            className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs"
          >
            <Upload className="w-4 h-4 text-slate-600" />
            <span>Восстановить из файла</span>
          </button>
        </div>

        {/* Кнопка «Скопировать код копии» */}
        <button
          onClick={handleCopyBackupCode}
          className="w-full py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          {isCopied ? (
            <Check className="w-3.5 h-3.5 text-emerald-600" />
          ) : (
            <Copy className="w-3.5 h-3.5 text-emerald-600" />
          )}
          <span>
            {isCopied ? 'Копия скопирована в буфер!' : 'Скопировать текст копии (для Telegram / заметок)'}
          </span>
        </button>
      </div>

      {/* Демо-данные */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
        <h2 className="text-xs font-bold text-slate-700">
          Демо-данные
        </h2>

        <p className="text-xs text-slate-500 leading-relaxed">
          Загружает пример расписания с готовыми темами уроков и практическими работами.
        </p>

        <button
          onClick={handleReset}
          className="w-full py-3 px-4 rounded-2xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 border border-slate-200 transition-all active:scale-95"
        >
          <RotateCcw className="w-4 h-4 text-emerald-600" />
          <span>Сбросить и загрузить пример расписания</span>
        </button>
      </div>

      {/* Подпись в самом низу экрана «Настройки» */}
      <div className="text-center pt-2">
        <p className="text-xs text-slate-400/50 font-medium select-none">
          © Сделано с любовью &lt;3
        </p>
      </div>

      {/* Модальное окно восстановления резервной копии */}
      {isRestoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setIsRestoreModalOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl z-10 max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Восстановление данных
                </h3>
                <p className="text-xs text-slate-400 font-medium">
                  Выберите файл .json или вставьте текст копии
                </p>
              </div>

              <button
                onClick={() => setIsRestoreModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-full transition-all active:scale-90"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Вариант 1: Загрузить файл */}
              <div>
                <p className="text-xs font-bold text-slate-700 mb-1.5">
                  Способ 1: Загрузить файл с устройства
                </p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs"
                >
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Выбрать .json файл на устройстве</span>
                </button>
              </div>

              {/* Разделитель */}
              <div className="flex items-center gap-2 py-1">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[11px] font-semibold text-slate-400 uppercase">или</span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Вариант 2: Вставить текст JSON */}
              <div>
                <p className="text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Способ 2: Вставить текст резервной копии</span>
                </p>
                <textarea
                  rows={5}
                  value={pasteBackupText}
                  onChange={(e) => setPasteBackupText(e.target.value)}
                  placeholder="Вставьте сюда сохранённый JSON-текст из Telegram или заметок..."
                  className="w-full p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 resize-none text-slate-700"
                />

                <button
                  type="button"
                  onClick={handleRestoreFromText}
                  disabled={!pasteBackupText.trim()}
                  className={`w-full mt-2 py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${
                    pasteBackupText.trim()
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>Восстановить из вставленного текста</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsRestoreModalOpen(false)}
                className="w-full py-2.5 px-4 rounded-2xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-white transition-all"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
