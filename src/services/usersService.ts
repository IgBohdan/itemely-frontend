import { api } from './api';
import { API_ROUTES } from '@/config/apiRoutes';

export interface User {
  id: number;
  email: string;
  fullName: string;
  phone?: string;
  defaultReminderTime?: number;
  defaultReminderUnit?: 'MINUTES' | 'HOURS' | 'DAYS';
  defaultReminderMethod?: 'EMAIL' | 'POPUP' | 'SMS';
}

export interface UpdateUserDto {
  fullName?: string;
  phone?: string;
  defaultReminderTime?: number;
  defaultReminderUnit?: 'MINUTES' | 'HOURS' | 'DAYS';
  defaultReminderMethod?: 'EMAIL' | 'POPUP' | 'SMS';
}

export const usersService = {
  async getAllUsers(): Promise<User[]> {
    const response = await api.get<User[]>(API_ROUTES.USERS.ALL);
    return response.data;
  },

  async getUserById(id: number): Promise<User> {
    const response = await api.get<User>(API_ROUTES.USERS.BY_ID(id));
    return response.data;
  },

  async deleteUser(id: number): Promise<void> {
    await api.delete(API_ROUTES.USERS.DELETE(id));
  },

  // Note: These endpoints might need to be implemented on backend
  async getCurrentUser(): Promise<User> {
    // Try to get from /users/me, fallback to getting user from token
    try {
      const response = await api.get<User>(API_ROUTES.USERS.ME);
      return response.data;
    } catch (error) {
      // If /users/me doesn't exist, we'll need to get user ID from token
      // For now, return user from localStorage
      if (typeof window !== 'undefined') {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          return JSON.parse(userStr);
        }
      }
      throw new Error('User not found');
    }
  },

  async updateUser(data: UpdateUserDto): Promise<User> {
    // Use /users/me endpoint
    const response = await api.patch<User>(API_ROUTES.USERS.UPDATE_ME, data);
    return response.data;
  },
};

