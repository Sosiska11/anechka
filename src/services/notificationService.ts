// src/services/notificationService.ts
import { Capacitor } from '@capacitor/core';
import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';
import { format, addDays, getDay } from 'date-fns';
import { storageService } from './storageService';

class NotificationService {
  public isNative(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Инициализация каналов уведомлений на Android
   */
  public async init(): Promise<void> {
    if (!this.isNative()) return;

    try {
      await LocalNotifications.createChannel({
        id: 'biology_lessons',
        name: 'Уроки',
        description: 'Напоминания перед звонком на урок',
        importance: 4, // High
        visibility: 1, // Public
        vibration: true,
      });

      await LocalNotifications.createChannel({
        id: 'biology_evening',
        name: 'Вечерние напоминания',
        description: 'Вечернее напоминание проверить темы уроков на завтра',
        importance: 3, // Default
        visibility: 1,
        vibration: true,
      });
    } catch (e) {
      console.warn('Failed to create notification channels:', e);
    }
  }

  /**
   * Запрос разрешений на отправку локальных уведомлений
   */
  public async requestPermissions(): Promise<boolean> {
    if (!this.isNative()) return true;

    try {
      const check = await LocalNotifications.checkPermissions();
      if (check.display === 'granted') {
        return true;
      }
      const req = await LocalNotifications.requestPermissions();
      return req.display === 'granted';
    } catch (e) {
      console.warn('Error requesting notification permissions:', e);
      return false;
    }
  }

  /**
   * Полная отмена всех запланированных уведомлений
   */
  public async cancelAll(): Promise<void> {
    if (!this.isNative()) return;

    try {
      const pending = await LocalNotifications.getPending();
      if (pending.notifications.length > 0) {
        await LocalNotifications.cancel({
          notifications: pending.notifications.map((n) => ({ id: n.id })),
        });
      }
    } catch (e) {
      console.warn('Error cancelling local notifications:', e);
    }
  }

  /**
   * Планировщик локальных уведомлений на ближайшие 7 дней
   */
  public async scheduleNext7Days(): Promise<{ scheduledCount: number }> {
    if (!this.isNative()) {
      return { scheduledCount: 0 };
    }

    try {
      const hasPerm = await this.requestPermissions();
      if (!hasPerm) {
        console.warn('Notification permission not granted');
        return { scheduledCount: 0 };
      }

      await this.cancelAll();

      const settings = storageService.getSettings();
      const defaultRoom = settings.defaultRoom || '304';
      const reminderMinutes = settings.reminderMinutesBefore;
      const eveningReminder = settings.eveningReminderTime;

      // Если оба типа напоминаний выключены, ничего не планируем
      if (reminderMinutes === null && !eveningReminder) {
        return { scheduledCount: 0 };
      }

      const notifications: LocalNotificationSchema[] = [];
      const now = new Date();
      const nowTime = now.getTime();

      // Проходим по ближайшим 7 дням (0 = сегодня, ..., 6 = через 6 дней)
      for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const targetDate = addDays(now, dayOffset);
        const dateStr = format(targetDate, 'yyyy-MM-dd');
        const dayOfWeekRaw = getDay(targetDate);

        // Получаем уроки на эту дату
        const { lessons, holiday } = storageService.getLessonsForDate(dateStr);
        const isHoliday = Boolean(holiday?.isHoliday);

        // 1. Уведомления перед уроками (только если не выходной и не воскресенье)
        if (!isHoliday && dayOfWeekRaw !== 0 && reminderMinutes !== null) {
          for (const lesson of lessons) {
            if (lesson.startTime === '--:--' || lesson.status === 'cancelled') {
              continue;
            }

            const [startHour, startMinute] = lesson.startTime.split(':').map(Number);
            const lessonStartDate = new Date(targetDate);
            lessonStartDate.setHours(startHour, startMinute, 0, 0);

            // Время срабатывания напоминания (за 5, 10 или 15 мин)
            const notifyTime = new Date(lessonStartDate.getTime() - reminderMinutes * 60 * 1000);

            // Проверяем, что момент уведомления ещё в будущем
            if (notifyTime.getTime() > nowTime) {
              const notifId = (dayOffset + 1) * 100 + lesson.lessonNumber;
              const room = lesson.room || defaultRoom;
              const title = `Скоро урок (${lesson.startTime}) • Каб. ${room}`;
              const body = lesson.topic
                ? `Тема: ${lesson.topic}`
                : 'Тема ещё не заполнена';

              notifications.push({
                id: notifId,
                title,
                body,
                channelId: 'biology_lessons',
                schedule: {
                  at: notifyTime,
                  allowWhileIdle: true,
                },
                extra: {
                  date: dateStr,
                  lessonNumber: lesson.lessonNumber,
                },
              });
            }
          }
        }

        // 2. Вечернее напоминание (в 19:00)
        if (eveningReminder) {
          const [evHour, evMinute] = eveningReminder.split(':').map(Number);
          const eveningDate = new Date(targetDate);
          eveningDate.setHours(evHour, evMinute, 0, 0);

          if (eveningDate.getTime() > nowTime) {
            // Проверяем, есть ли завтра уроки
            const nextDate = addDays(targetDate, 1);
            const nextDateStr = format(nextDate, 'yyyy-MM-dd');
            const nextDayLessons = storageService.getLessonsForDate(nextDateStr);

            // Напоминаем только если завтра рабочий день и есть уроки
            if (
              !nextDayLessons.holiday?.isHoliday &&
              getDay(nextDate) !== 0 &&
              nextDayLessons.lessons.length > 0
            ) {
              const notifId = 9000 + dayOffset;
              notifications.push({
                id: notifId,
                title: 'Напоминание',
                body: 'Проверьте темы уроков на завтра',
                channelId: 'biology_evening',
                schedule: {
                  at: eveningDate,
                  allowWhileIdle: true,
                },
              });
            }
          }
        }
      }

      if (notifications.length > 0) {
        await LocalNotifications.schedule({ notifications });
      }

      return { scheduledCount: notifications.length };
    } catch (e) {
      console.warn('Error scheduling notifications:', e);
      return { scheduledCount: 0 };
    }
  }

  /**
   * Отправка тестового напоминания через 3 секунды (для проверки работы на смартфоне)
   */
  public async sendTestNotification(): Promise<boolean> {
    if (!this.isNative()) return false;

    try {
      const hasPerm = await this.requestPermissions();
      if (!hasPerm) return false;

      await LocalNotifications.schedule({
        notifications: [
          {
            id: 99999,
            title: 'Скоро урок (10:00) • Каб. 304',
            body: 'Тема: Клеточное строение живых организмов',
            channelId: 'biology_lessons',
            schedule: {
              at: new Date(Date.now() + 3000),
              allowWhileIdle: true,
            },
          },
        ],
      });
      return true;
    } catch (e) {
      console.warn('Error sending test notification:', e);
      return false;
    }
  }
}

export const notificationService = new NotificationService();

