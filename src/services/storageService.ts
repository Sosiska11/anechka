// src/services/storageService.ts
import { format, startOfWeek, addDays, getDay, parseISO } from 'date-fns';
import {
  BellSlot,
  ScheduleTemplateItem,
  LessonInstance,
  DayOverride,
  AppSettings,
  DisplayLesson,
} from '../types';

const STORAGE_KEYS = {
  BELLS: 'teacher_planner_bells',
  TEMPLATE: 'teacher_planner_template',
  LESSONS: 'teacher_planner_lessons',
  HOLIDAYS: 'teacher_planner_holidays',
  SETTINGS: 'teacher_planner_settings',
  INITIALIZED: 'teacher_planner_initialized_v9_grades5_11',
};

// Базовая сетка звонков школы (1–8 уроки по 45 мин)
export const DEFAULT_BELLS: BellSlot[] = [
  { lessonNumber: 1, startTime: '08:30', endTime: '09:15' },
  { lessonNumber: 2, startTime: '09:25', endTime: '10:10' },
  { lessonNumber: 3, startTime: '10:25', endTime: '11:10' },
  { lessonNumber: 4, startTime: '11:30', endTime: '12:15' },
  { lessonNumber: 5, startTime: '12:30', endTime: '13:15' },
  { lessonNumber: 6, startTime: '13:30', endTime: '14:15' },
  { lessonNumber: 7, startTime: '14:25', endTime: '15:10' },
  { lessonNumber: 8, startTime: '15:20', endTime: '16:05' },
];

// Базовый шаблон недели с классами 5–11 (Пн–Сб)
export const DEFAULT_TEMPLATE: ScheduleTemplateItem[] = [
  // Понедельник (1)
  { id: 'tmpl-1-1', dayOfWeek: 1, lessonNumber: 1, className: '5А' },
  { id: 'tmpl-1-2', dayOfWeek: 1, lessonNumber: 2, className: '7А' },
  { id: 'tmpl-1-3', dayOfWeek: 1, lessonNumber: 3, className: '8Б' },
  { id: 'tmpl-1-4', dayOfWeek: 1, lessonNumber: 4, className: '10А' },

  // Вторник (2)
  { id: 'tmpl-2-2', dayOfWeek: 2, lessonNumber: 2, className: '6А' },
  { id: 'tmpl-2-3', dayOfWeek: 2, lessonNumber: 3, className: '8А' },
  { id: 'tmpl-2-4', dayOfWeek: 2, lessonNumber: 4, className: '9Б' },
  { id: 'tmpl-2-5', dayOfWeek: 2, lessonNumber: 5, className: '11А' },

  // Среда (3)
  { id: 'tmpl-3-1', dayOfWeek: 3, lessonNumber: 1, className: '5Б' },
  { id: 'tmpl-3-2', dayOfWeek: 3, lessonNumber: 2, className: '7Б' },
  { id: 'tmpl-3-3', dayOfWeek: 3, lessonNumber: 3, className: '9А' },

  // Четверг (4)
  { id: 'tmpl-4-1', dayOfWeek: 4, lessonNumber: 1, className: '6Б' },
  { id: 'tmpl-4-2', dayOfWeek: 4, lessonNumber: 2, className: '7А' },
  { id: 'tmpl-4-3', dayOfWeek: 4, lessonNumber: 3, className: '8Б' },
  { id: 'tmpl-4-4', dayOfWeek: 4, lessonNumber: 4, className: '10А' },

  // Пятница (5)
  { id: 'tmpl-5-2', dayOfWeek: 5, lessonNumber: 2, className: '5А' },
  { id: 'tmpl-5-3', dayOfWeek: 5, lessonNumber: 3, className: '8А' },
  { id: 'tmpl-5-4', dayOfWeek: 5, lessonNumber: 4, className: '10Б' },
  { id: 'tmpl-5-5', dayOfWeek: 5, lessonNumber: 5, className: '11А' },

  // Суббота (6)
  { id: 'tmpl-6-1', dayOfWeek: 6, lessonNumber: 1, className: '9Б' },
  { id: 'tmpl-6-2', dayOfWeek: 6, lessonNumber: 2, className: '11Б' },
];

export const DEFAULT_SETTINGS: AppSettings = {
  defaultRoom: '304',
  reminderMinutesBefore: 10,
  eveningReminderTime: '19:00',
  showSaturday: true,
};

// Генерация реалистичных демо-уроков на текущую неделю
export function generateDemoLessonsForCurrentWeek(): LessonInstance[] {
  const today = new Date();
  const monday = startOfWeek(today, { weekStartsOn: 1 });
  const monStr = format(monday, 'yyyy-MM-dd');
  const tueStr = format(addDays(monday, 1), 'yyyy-MM-dd');
  const wedStr = format(addDays(monday, 2), 'yyyy-MM-dd');
  const thuStr = format(addDays(monday, 3), 'yyyy-MM-dd');
  const friStr = format(addDays(monday, 4), 'yyyy-MM-dd');

  return [
    // Понедельник
    {
      id: `demo-${monStr}-1`,
      date: monStr,
      lessonNumber: 1,
      className: '5А',
      room: '304',
      topic: 'Увеличительные приборы: устройство светового микроскопа',
      lessonType: 'lab',
      homework: 'Параграф 5, зарисовать оптическую схему в тетрадь',
      notes: 'Напомнить технику безопасности при работе со стеклом',
      status: 'completed',
    },
    {
      id: `demo-${monStr}-2`,
      date: monStr,
      lessonNumber: 2,
      className: '7А',
      room: '304',
      topic: 'Тип Членистоногие: классификация и общие признаки',
      lessonType: 'regular',
      homework: 'Параграф 19, вопросы 1–4',
      notes: '',
      status: 'completed',
    },
    {
      id: `demo-${monStr}-3`,
      date: monStr,
      lessonNumber: 3,
      className: '8Б',
      room: '304',
      topic: 'Кровь: форменные элементы и функции плазмы',
      lessonType: 'lab',
      homework: 'Параграф 17, заполнить сравнительную таблицу',
      notes: 'Сравнить мазки крови человека и лягушки',
      status: 'completed',
    },

    // Вторник
    {
      id: `demo-${tueStr}-2`,
      date: tueStr,
      lessonNumber: 2,
      className: '6А',
      room: '304',
      topic: 'Моногибридное скрещивание. Первый закон Менделя',
      lessonType: 'regular',
      homework: 'Задачи № 1–3 на закон единообразия',
      notes: 'Вызвать к доске на решение решётки Пеннета',
      status: 'completed',
    },
    {
      id: `demo-${tueStr}-3`,
      date: tueStr,
      lessonNumber: 3,
      className: '8А',
      room: '304',
      topic: 'Строение растительной клетки. Пластиды и вакуоли',
      lessonType: 'regular',
      homework: 'Параграф 6, повторить органоиды',
      notes: '',
      status: 'completed',
    },

    // Среда
    {
      id: `demo-${wedStr}-1`,
      date: wedStr,
      lessonNumber: 1,
      className: '5Б',
      room: '304',
      topic: 'Иммунная система организма. Вакцинация и сыворотки',
      lessonType: 'regular',
      homework: 'Параграф 18, подготовить сообщение о Луи Пастере',
      notes: '',
      status: 'completed',
    },
    {
      id: `demo-${wedStr}-2`,
      date: wedStr,
      lessonNumber: 2,
      className: '7Б',
      room: '304',
      topic: 'Нуклеиновые кислоты: структура и репликация ДНК',
      lessonType: 'regular',
      homework: 'Параграф 12, решить задачи на комплементарность',
      notes: '',
      status: 'completed',
    },

    // Четверг
    {
      id: `demo-${thuStr}-1`,
      date: thuStr,
      lessonNumber: 1,
      className: '6Б',
      room: '304',
      topic: 'Клеточное строение листа. Хлоропласты и устьица',
      lessonType: 'lab',
      homework: 'Параграф 7, зарисовать устьичный аппарат',
      notes: 'Подготовить покровные стёкла и микропрепараты',
      status: 'planned',
    },
    {
      id: `demo-${thuStr}-2`,
      date: thuStr,
      lessonNumber: 2,
      className: '7А',
      room: '304',
      topic: 'Класс Насекомые: органы чувств и ротовые аппараты',
      lessonType: 'lab',
      homework: 'Параграф 25, вопросы 1–5',
      notes: 'Раздать энтомологические коллекции',
      status: 'planned',
    },
    {
      id: `demo-${thuStr}-3`,
      date: thuStr,
      lessonNumber: 3,
      className: '8Б',
      room: '304',
      topic: 'Строение сердца и фазы сердечного цикла',
      lessonType: 'practical',
      homework: 'Параграф 21, измерить ЧСС в покое и под нагрузкой',
      notes: 'Показать анатомический муляж сердца',
      status: 'planned',
    },
    {
      id: `demo-${thuStr}-4`,
      date: thuStr,
      lessonNumber: 4,
      className: '10А',
      room: '304',
      topic: 'Митоз и мейоз: фазы деления эукариотической клетки',
      lessonType: 'regular',
      homework: 'Таблица: стадии митоза и набор хромосом',
      notes: 'Разобрать механизм кроссинговера',
      status: 'planned',
    },

    // Пятница
    {
      id: `demo-${friStr}-2`,
      date: friStr,
      lessonNumber: 2,
      className: '5А',
      room: '304',
      topic: 'Типы развития насекомых: полное и неполное превращение',
      lessonType: 'regular',
      homework: 'Параграф 26, схема стадий развития',
      notes: '',
      status: 'planned',
    },
    {
      id: `demo-${friStr}-3`,
      date: friStr,
      lessonNumber: 3,
      className: '8А',
      room: '304',
      topic: 'Контрольная работа: Законы Менделя и генетика пола',
      lessonType: 'test',
      homework: 'Повторить конспект и терминологию',
      notes: 'Раздать варианты контрольных заданий',
      status: 'planned',
    },
  ];
}

class StorageService {
  public initStorage(): void {
    if (!localStorage.getItem(STORAGE_KEYS.INITIALIZED)) {
      this.resetToDemoData();
    }
  }

  public resetToDemoData(): void {
    this.saveBells(DEFAULT_BELLS);
    this.saveTemplate(DEFAULT_TEMPLATE);
    this.saveLessons(generateDemoLessonsForCurrentWeek());
    this.saveHolidays([]);
    this.saveSettings(DEFAULT_SETTINGS);
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }

  /**
   * Полная очистка данных: удаляет все демо-уроки, расписание и темы,
   * оставляя приложение абсолютно чистым для заполнения с нуля.
   */
  public clearAllData(): void {
    this.saveTemplate([]);
    this.saveLessons([]);
    this.saveHolidays([]);
    this.saveBells(DEFAULT_BELLS);
    this.saveSettings(DEFAULT_SETTINGS);
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }

  // --- Звонки (1–8 уроки) ---
  public getBells(): BellSlot[] {
    const raw = localStorage.getItem(STORAGE_KEYS.BELLS);
    if (!raw) return DEFAULT_BELLS;
    try {
      const parsed: BellSlot[] = JSON.parse(raw);
      if (parsed.length < 8) {
        for (let i = parsed.length + 1; i <= 8; i++) {
          const defaultSlot = DEFAULT_BELLS.find((b) => b.lessonNumber === i);
          if (defaultSlot) parsed.push(defaultSlot);
        }
      }
      return parsed.sort((a, b) => a.lessonNumber - b.lessonNumber);
    } catch {
      return DEFAULT_BELLS;
    }
  }

  public saveBells(bells: BellSlot[]): void {
    localStorage.setItem(STORAGE_KEYS.BELLS, JSON.stringify(bells));
  }

  // --- Шаблон расписания недели ---
  public getTemplate(): ScheduleTemplateItem[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TEMPLATE);
    if (!raw) return DEFAULT_TEMPLATE;
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_TEMPLATE;
    }
  }

  public saveTemplate(template: ScheduleTemplateItem[]): void {
    localStorage.setItem(STORAGE_KEYS.TEMPLATE, JSON.stringify(template));
  }

  public setTemplateSlot(
    dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6,
    lessonNumber: number,
    className?: string,
    roomOverride?: string
  ): void {
    const template = this.getTemplate();
    const existingIndex = template.findIndex(
      (t) => t.dayOfWeek === dayOfWeek && t.lessonNumber === lessonNumber
    );

    const newItem: ScheduleTemplateItem = {
      id: `tmpl-${dayOfWeek}-${lessonNumber}`,
      dayOfWeek,
      lessonNumber,
      className: className?.trim() || undefined,
      roomOverride: roomOverride?.trim() || undefined,
    };

    if (existingIndex >= 0) {
      template[existingIndex] = newItem;
    } else {
      template.push(newItem);
    }

    this.saveTemplate(template);
  }

  public removeTemplateSlot(
    dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6,
    lessonNumber: number
  ): void {
    const template = this.getTemplate().filter(
      (t) => !(t.dayOfWeek === dayOfWeek && t.lessonNumber === lessonNumber)
    );
    this.saveTemplate(template);
  }

  // --- Экземпляры уроков ---
  public getLessons(): LessonInstance[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LESSONS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public saveLessons(lessons: LessonInstance[]): void {
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
  }

  public getLessonById(id: string): LessonInstance | undefined {
    return this.getLessons().find((l) => l.id === id);
  }

  public saveLesson(lesson: LessonInstance): void {
    const lessons = this.getLessons();
    const index = lessons.findIndex((l) => l.id === lesson.id);
    if (index >= 0) {
      lessons[index] = lesson;
    } else {
      lessons.push(lesson);
    }
    this.saveLessons(lessons);
  }

  public deleteLesson(id: string): void {
    const lessons = this.getLessons().filter((l) => l.id !== id);
    this.saveLessons(lessons);
  }

  // --- Выходные и каникулы ---
  public getHolidays(): DayOverride[] {
    const raw = localStorage.getItem(STORAGE_KEYS.HOLIDAYS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  public saveHolidays(holidays: DayOverride[]): void {
    localStorage.setItem(STORAGE_KEYS.HOLIDAYS, JSON.stringify(holidays));
  }

  public getHolidayForDate(dateStr: string): DayOverride | undefined {
    return this.getHolidays().find((h) => h.date === dateStr);
  }

  public toggleHoliday(dateStr: string, label: string = 'Каникулы / Выходной'): boolean {
    const holidays = this.getHolidays();
    const existingIndex = holidays.findIndex((h) => h.date === dateStr);

    if (existingIndex >= 0) {
      const current = holidays[existingIndex];
      if (current.isHoliday) {
        holidays.splice(existingIndex, 1);
        this.saveHolidays(holidays);
        return false;
      } else {
        current.isHoliday = true;
        current.label = label;
        this.saveHolidays(holidays);
        return true;
      }
    } else {
      holidays.push({ date: dateStr, isHoliday: true, label });
      this.saveHolidays(holidays);
      return true;
    }
  }

  // --- Настройки ---
  public getSettings(): AppSettings {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // --- Экспорт / Импорт ---
  public exportBackup(): string {
    const data = {
      app: 'BioPlanner',
      version: '3.0-classes',
      createdAt: new Date().toISOString(),
      bells: this.getBells(),
      template: this.getTemplate(),
      lessons: this.getLessons(),
      holidays: this.getHolidays(),
      settings: this.getSettings(),
    };
    return JSON.stringify(data, null, 2);
  }

  public importBackup(jsonString: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonString);
      if (!data || typeof data !== 'object') {
        return { success: false, message: 'Неверный формат файла резервной копии' };
      }
      if (Array.isArray(data.bells)) this.saveBells(data.bells);
      if (Array.isArray(data.template)) this.saveTemplate(data.template);
      if (Array.isArray(data.lessons)) this.saveLessons(data.lessons);
      if (Array.isArray(data.holidays)) this.saveHolidays(data.holidays);
      if (data.settings && typeof data.settings === 'object') this.saveSettings(data.settings);

      return { success: true, message: 'Резервная копия успешно восстановлена' };
    } catch {
      return { success: false, message: 'Ошибка чтения JSON-файла' };
    }
  }

  /**
   * Получение уроков на дату:
   * Автоматически подтягивает уроки из шаблона недели, если на эту дату ещё не сохранены записи
   */
  public getLessonsForDate(dateStr: string): {
    lessons: DisplayLesson[];
    holiday?: DayOverride;
  } {
    const holiday = this.getHolidayForDate(dateStr);
    if (holiday && holiday.isHoliday) {
      return { lessons: [], holiday };
    }

    const date = parseISO(dateStr);
    const dayRaw = getDay(date);
    if (dayRaw === 0) {
      return {
        lessons: [],
        holiday: {
          date: dateStr,
          isHoliday: true,
          label: 'Воскресенье — выходной день',
        },
      };
    }

    const dayOfWeek = dayRaw as 1 | 2 | 3 | 4 | 5 | 6;
    const bells = this.getBells();
    const settings = this.getSettings();
    const defaultRoom = settings.defaultRoom || '304';
    const template = this.getTemplate().filter((t) => t.dayOfWeek === dayOfWeek);
    const savedLessons = this.getLessons().filter((l) => l.date === dateStr);

    const bellMap = new Map<number, BellSlot>(bells.map((b) => [b.lessonNumber, b]));
    const templateMap = new Map<number, ScheduleTemplateItem>(
      template.map((t) => [t.lessonNumber, t])
    );
    const displayLessons: DisplayLesson[] = [];
    const usedLessonNumbers = new Set<number>();

    // 1. Сохранённые уроки на эту дату
    for (const saved of savedLessons) {
      const bell = bellMap.get(saved.lessonNumber);
      const tmpl = templateMap.get(saved.lessonNumber);
      usedLessonNumbers.add(saved.lessonNumber);

      displayLessons.push({
        id: saved.id,
        date: saved.date,
        lessonNumber: saved.lessonNumber,
        startTime: bell ? bell.startTime : '--:--',
        endTime: bell ? bell.endTime : '--:--',
        className: saved.className || tmpl?.className || undefined,
        room: saved.room || defaultRoom,
        topic: saved.topic || '',
        lessonType: saved.lessonType || 'regular',
        homework: saved.homework || '',
        notes: saved.notes || '',
        status: saved.status,
        isExtra: saved.isExtra,
        isVirtual: false,
      });
    }

    // 2. Уроки по шаблону недели (виртуальные)
    for (const tmpl of template) {
      if (!usedLessonNumbers.has(tmpl.lessonNumber)) {
        const bell = bellMap.get(tmpl.lessonNumber);

        displayLessons.push({
          id: `virtual-${dateStr}-${tmpl.lessonNumber}`,
          date: dateStr,
          lessonNumber: tmpl.lessonNumber,
          startTime: bell ? bell.startTime : '--:--',
          endTime: bell ? bell.endTime : '--:--',
          className: tmpl.className || undefined,
          room: tmpl.roomOverride || defaultRoom,
          topic: '',
          lessonType: 'regular',
          homework: '',
          notes: '',
          status: 'planned',
          isExtra: false,
          isVirtual: true,
        });
      }
    }

    displayLessons.sort((a, b) => a.lessonNumber - b.lessonNumber);

    return { lessons: displayLessons };
  }

  /**
   * Быстрый перенос темы урока на следующий урок того же класса по расписанию
   */
  public transferTopicToNextLesson(currentLesson: DisplayLesson): {
    success: boolean;
    nextDate?: string;
    message: string;
  } {
    if (!currentLesson.topic) {
      return { success: false, message: 'Тема текущего урока пуста' };
    }

    const startDate = parseISO(currentLesson.date);
    const template = this.getTemplate();
    const holidays = this.getHolidays();
    const settings = this.getSettings();
    const targetClass = currentLesson.className;

    for (let dayOffset = 1; dayOffset <= 28; dayOffset++) {
      const candidateDate = addDays(startDate, dayOffset);
      const dateStr = format(candidateDate, 'yyyy-MM-dd');

      const isHoliday = holidays.some((h) => h.date === dateStr && h.isHoliday);
      const dayRaw = getDay(candidateDate);
      if (isHoliday || dayRaw === 0) continue;

      const dayOfWeek = dayRaw as 1 | 2 | 3 | 4 | 5 | 6;

      // 1. Проверяем сохраненные инстансы того же класса (или любого следующего, если класс не задан)
      const savedForDay = this.getLessons().filter((l) => {
        if (l.date !== dateStr) return false;
        if (targetClass) return l.className === targetClass;
        return true;
      });

      if (savedForDay.length > 0) {
        const nextTarget = savedForDay[0];
        const oldTopicNote = nextTarget.topic
          ? ` (Прежняя тема: ${nextTarget.topic})`
          : '';
        nextTarget.topic = currentLesson.topic;
        nextTarget.lessonType = currentLesson.lessonType;
        if (currentLesson.homework) {
          nextTarget.homework = currentLesson.homework;
        }
        if (oldTopicNote) {
          nextTarget.notes = (nextTarget.notes ? nextTarget.notes + '\n' : '') + oldTopicNote;
        }
        this.saveLesson(nextTarget);

        this.markCurrentLessonTransferred(currentLesson, dateStr);

        const classLabel = nextTarget.className ? `${nextTarget.className} класс` : 'урок';
        return {
          success: true,
          nextDate: dateStr,
          message: `Тема перенесена на ${classLabel} (${dateStr}, №${nextTarget.lessonNumber})`,
        };
      }

      // 2. Проверяем шаблон расписания недели
      const tmplItem = template.find((t) => {
        if (t.dayOfWeek !== dayOfWeek) return false;
        if (targetClass) return t.className === targetClass;
        return true;
      });

      if (tmplItem) {
        const newInstance: LessonInstance = {
          id: `inst-${dateStr}-${tmplItem.lessonNumber}-${Date.now()}`,
          date: dateStr,
          lessonNumber: tmplItem.lessonNumber,
          className: tmplItem.className || currentLesson.className,
          room: tmplItem.roomOverride || settings.defaultRoom || '304',
          topic: currentLesson.topic,
          lessonType: currentLesson.lessonType,
          homework: currentLesson.homework || '',
          notes: `Тема перенесена с урока от ${currentLesson.date}`,
          status: 'planned',
        };
        this.saveLesson(newInstance);

        this.markCurrentLessonTransferred(currentLesson, dateStr);

        const classLabel = newInstance.className ? `${newInstance.className} класс` : 'урок';
        return {
          success: true,
          nextDate: dateStr,
          message: `Тема перенесена на ${classLabel} (${dateStr}, №${tmplItem.lessonNumber})`,
        };
      }
    }

    return {
      success: false,
      message: 'Не найден следующий урок этого класса в расписании',
    };
  }

  private markCurrentLessonTransferred(
    lesson: DisplayLesson,
    transferredToDate: string
  ): void {
    const noteTransfer = `[Тема перенесена на ${transferredToDate}]`;
    const instanceId = lesson.isVirtual
      ? `inst-${lesson.date}-${lesson.lessonNumber}-${Date.now()}`
      : lesson.id;

    const updatedCurrent: LessonInstance = {
      id: instanceId,
      date: lesson.date,
      lessonNumber: lesson.lessonNumber,
      className: lesson.className,
      room: lesson.room || '304',
      topic: lesson.topic,
      lessonType: lesson.lessonType,
      homework: lesson.homework || '',
      notes: lesson.notes ? `${lesson.notes}\n${noteTransfer}` : noteTransfer,
      status: 'completed',
    };
    this.saveLesson(updatedCurrent);
  }
}

export const storageService = new StorageService();
