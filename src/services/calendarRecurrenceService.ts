import { api } from './api';
import { API_ROUTES } from '@/config/apiRoutes';

export interface Recurrence {
  id: number;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  monthOfYear?: number;
  startDate: string;
  endDate?: string;
  event: {
    id: number;
    title: string;
  };
}

export interface CreateRecurrenceDto {
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  interval?: number;
  daysOfWeek?: number[];
  dayOfMonth?: number;
  monthOfYear?: number;
  startDate: string;
  endDate?: string;
}

export interface UpdateRecurrenceDto extends CreateRecurrenceDto {}

export const calendarRecurrenceService = {
  async getRecurrence(eventId: number): Promise<Recurrence> {
    const response = await api.get<Recurrence>(API_ROUTES.CALENDAR.RECURRENCE.GET(eventId));
    return response.data;
  },

  async createRecurrence(eventId: number, data: CreateRecurrenceDto): Promise<Recurrence> {
    const response = await api.post<Recurrence>(
      API_ROUTES.CALENDAR.RECURRENCE.CREATE(eventId),
      data
    );
    return response.data;
  },

  async updateRecurrence(eventId: number, data: UpdateRecurrenceDto): Promise<Recurrence> {
    const response = await api.put<Recurrence>(
      API_ROUTES.CALENDAR.RECURRENCE.UPDATE(eventId),
      data
    );
    return response.data;
  },

  async deleteRecurrence(eventId: number): Promise<void> {
    await api.delete(API_ROUTES.CALENDAR.RECURRENCE.DELETE(eventId));
  },
};

