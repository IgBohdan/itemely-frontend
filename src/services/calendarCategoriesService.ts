// src/services/calendarCategoriesService.ts

import { API_ROUTES } from '@/config/apiRoutes';
import { api } from './api';

export interface CategoryDto {
  name: string;
  color?: string; // опціонально, якщо категорії мають колір
}

export interface Category {
  id: number;
  name: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

// Отримати всі категорії
export const getAllCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>(API_ROUTES.CATEGORIES.ALL);
  return response.data;
};

// Створити нову категорію
export const createCategory = async (data: CategoryDto): Promise<Category> => {
  const response = await api.post<Category>(API_ROUTES.CATEGORIES.CREATE, data);
  return response.data;
};

// Видалити категорію
export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(API_ROUTES.CATEGORIES.DELETE(id));
};

// Оновити категорію (опціонально)
export const updateCategory = async (
  id: number,
  data: Partial<CategoryDto>
): Promise<Category> => {
  const response = await api.patch<Category>(
    API_ROUTES.CATEGORIES.DELETE(id), // ← тут помилка в оригіналі — має бути окремий UPDATE
    data
  );
  return response.data;
};

// Якщо в API_ROUTES немає UPDATE для категорій — додай його туди:
// CATEGORIES: {
//   ...
//   UPDATE: (id: number) => `/categories/${id}`,
// }

// Отримати одну категорію (опціонально)
export const getCategoryById = async (id: number): Promise<Category> => {
  const response = await api.get<Category>(API_ROUTES.CATEGORIES.DELETE(id)); // ← теж має бути окремий BY_ID
  return response.data;
};

// Рекомендація: додай в API_ROUTES
// CATEGORIES: {
//   ...
//   BY_ID: (id: number) => `/categories/${id}`,
//   UPDATE: (id: number) => `/categories/${id}`,
// }

export const calendarCategoriesService = {
  getAllCategories,
  createCategory,
  deleteCategory,
  updateCategory,
  getCategoryById,
};

export default calendarCategoriesService;