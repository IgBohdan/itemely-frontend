import { api } from './api';
import { API_ROUTES } from '@/config/apiRoutes';

export interface Reminder {
  id: number;
  time: number;
  unit: 'MINUTES' | 'HOURS' | 'DAYS';
  method: 'EMAIL' | 'POPUP' | 'SMS';
  event: {
    id: number;
    title: string;
  };
  user: {
    id: number;
    email: string;
    fullName: string;
  };
}

export interface CreateReminderDto {
  time: number;
  unit: 'MINUTES' | 'HOURS' | 'DAYS';
  method: 'EMAIL' | 'POPUP' | 'SMS';
}

export interface UpdateReminderDto extends CreateReminderDto {}

export const calendarRemindersService = {
  async getAllReminders(eventId: number): Promise<Reminder[]> {
    const response = await api.get<Reminder[]>(API_ROUTES.CALENDAR.REMINDERS.ALL(eventId));
    return response.data;
  },

  async getReminderById(eventId: number, id: number): Promise<Reminder> {
    const response = await api.get<Reminder>(API_ROUTES.CALENDAR.REMINDERS.BY_ID(eventId, id));
    return response.data;
  },

  async createReminder(eventId: number, data: CreateReminderDto): Promise<Reminder> {
    const response = await api.post<Reminder>(
      API_ROUTES.CALENDAR.REMINDERS.CREATE(eventId),
      data
    );
    return response.data;
  },

  async updateReminder(
    eventId: number,
    id: number,
    data: UpdateReminderDto
  ): Promise<Reminder> {
    const response = await api.put<Reminder>(
      API_ROUTES.CALENDAR.REMINDERS.UPDATE(eventId, id),
      data
    );
    return response.data;
  },

  async deleteReminder(eventId: number, id: number): Promise<void> {
    await api.delete(API_ROUTES.CALENDAR.REMINDERS.DELETE(eventId, id));
  },
};

