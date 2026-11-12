// src/types.ts

// Слот расписания звонков (1–8 уроки)
export interface BellSlot {
  lessonNumber: number; // 1, 2, 3...
  startTime: string;    // "08:30"
  endTime: string;      // "09:15"
}

// Элемент шаблона недели (1–8 уроки, Пн–Сб)
export interface ScheduleTemplateItem {
  id: string;
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6; // 1 = Пн, ..., 6 = Сб
  lessonNumber: number;
  roomOverride?: string; // Если урок проходит не в основном кабинете биологии
}

// Тип урока биологии
export type LessonType = 'regular' | 'lab' | 'practical' | 'test';

// Конкретный урок на конкретную календарную дату
export interface LessonInstance {
  id: string;
  date: string;         // Формат "YYYY-MM-DD"
  lessonNumber: number;
  room: string;         // Подставляется из AppSettings.defaultRoom, если не переопределён
  topic: string;        // Тема урока
  lessonType: LessonType; // Обычный / Лабораторная / Практическая / Контрольная
  homework: string;     // Домашнее задание
  notes: string;        // Личные заметки ("проверить тетради", "распечатать карточки")
  status: 'planned' | 'completed' | 'cancelled';
  isExtra?: boolean;    // true, если это разовый урок / замена вне шаблона
}

// Особые дни (каникулы, праздники, отмены)
export interface DayOverride {
  date: string;         // "YYYY-MM-DD"
  isHoliday: boolean;
  label?: string;       // Например: "Осенние каникулы"
}

// Настройки приложения
export interface AppSettings {
  defaultRoom: string;                  // Основной кабинет биологии (например, "304")
  reminderMinutesBefore: number | null; // 5, 10, 15 или null (выкл)
  eveningReminderTime: string | null;   // Например: "19:00" или null
  showSaturday: boolean;                // Показывать ли субботу в сетке
}

// Вспомогательный интерфейс для отображения урока в интерфейсе (объединённые данные)
export interface DisplayLesson {
  id: string;                  // ID инстанса или виртуальный ID
  date: string;                // "YYYY-MM-DD"
  lessonNumber: number;
  startTime: string;           // "08:30"
  endTime: string;             // "09:15"
  room: string;                // "304"
  topic: string;               // Тема урока
  lessonType: LessonType;      // Тип урока
  homework: string;            // Домашнее задание
  notes: string;               // Заметки
  status: 'planned' | 'completed' | 'cancelled';
  isExtra?: boolean;
  isVirtual: boolean;          // true, если урок сгенерирован по шаблону и еще не сохранен как экземпляр
}

// Навигационные вкладки приложения
export type TabType = 'today' | 'calendar' | 'schedule' | 'settings';
