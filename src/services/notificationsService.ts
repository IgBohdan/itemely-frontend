import { api } from './api';
import { API_ROUTES } from '@/config/apiRoutes';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  user: {
    id: number;
    email: string;
    fullName: string;
  };
}

export const notificationsService = {
  async getAllNotifications(): Promise<Notification[]> {
    const response = await api.get<Notification[]>(API_ROUTES.NOTIFICATIONS.ALL);
    return response.data;
  },

  async markAsRead(id: number): Promise<Notification> {
    const response = await api.post<Notification>(API_ROUTES.NOTIFICATIONS.MARK_AS_READ(id));
    return response.data;
  },
};

