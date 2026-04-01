import { api } from './api';
import { API_ROUTES } from '@/config/apiRoutes';

export interface Tag {
  id: number;
  name: string;
  color?: string;
  user: {
    id: number;
    email: string;
    fullName: string;
  };
}

export interface CreateTagDto {
  name: string;
  color?: string;
}

export interface UpdateTagDto extends CreateTagDto {}

export const calendarTagsService = {
  async getAllTags(): Promise<Tag[]> {
    const response = await api.get<Tag[]>(API_ROUTES.CALENDAR.TAGS.ALL);
    return response.data;
  },

  async getTagById(id: number): Promise<Tag> {
    const response = await api.get<Tag>(API_ROUTES.CALENDAR.TAGS.BY_ID(id));
    return response.data;
  },

  async createTag(data: CreateTagDto): Promise<Tag> {
    const response = await api.post<Tag>(API_ROUTES.CALENDAR.TAGS.CREATE, data);
    return response.data;
  },

  async updateTag(id: number, data: UpdateTagDto): Promise<Tag> {
    const response = await api.put<Tag>(API_ROUTES.CALENDAR.TAGS.UPDATE(id), data);
    return response.data;
  },

  async deleteTag(id: number): Promise<void> {
    await api.delete(API_ROUTES.CALENDAR.TAGS.DELETE(id));
  },
};

