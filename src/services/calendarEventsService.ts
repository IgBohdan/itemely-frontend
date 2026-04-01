// src/services/calendarEventsService.ts
import { API_ROUTES } from "@/config/apiRoutes";
import { api } from "./api";

export interface Tag {
  id: number;
  name: string;
  color?: string;
}

export interface Category {
  id: number;
  name: string;
  color: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  description?: string;
  startDateTime: string; // ISO string
  endDateTime: string; // ISO string
  isAllDay: boolean;
  location?: string;
  category?: Category;
  tags?: Tag[];
  user: {
    id: number;
    email: string;
    fullName: string;
  };
}

export interface CreateEventDto {
  title: string;
  description?: string;
  startDateTime: string;
  endDateTime: string;
  isAllDay?: boolean;
  location?: string;
  categoryId?: number | null;
  tagIds?: number[];
}

export type UpdateEventDto = Partial<CreateEventDto>;

export const calendarEventsService = {
  async getAllEvents(): Promise<CalendarEvent[]> {
    const response = await api.get<CalendarEvent[]>(
      API_ROUTES.CALENDAR.EVENTS.ALL
    );
    return response.data;
  },

  async getEventById(id: number): Promise<CalendarEvent> {
    const response = await api.get<CalendarEvent>(API_ROUTES.CALENDAR.EVENTS.GET(id));
    return response.data;
  },

  async createEvent(data: CreateEventDto): Promise<CalendarEvent> {
    const response = await api.post<CalendarEvent>(
      API_ROUTES.CALENDAR.EVENTS.CREATE,
      data
    );
    return response.data;
  },

  async updateEvent(id: number, data: UpdateEventDto): Promise<CalendarEvent> {
    const response = await api.put<CalendarEvent>(
      API_ROUTES.CALENDAR.EVENTS.UPDATE(id),
      data
    );
    return response.data;
  },

  async deleteEvent(id: number): Promise<void> {
    await api.delete(API_ROUTES.CALENDAR.EVENTS.DELETE(id));
  },
};

export const calendarTagsService = {
  async getAllTags(): Promise<Tag[]> {
    const response = await api.get<Tag[]>(API_ROUTES.CALENDAR.TAGS.ALL);
    return response.data;
  },

  async createTag(data: { name: string; color: string }): Promise<Tag> {
    const response = await api.post<Tag>(API_ROUTES.CALENDAR.TAGS.CREATE, data);
    return response.data;
  },

  async deleteTag(id: number): Promise<void> {
    await api.delete(API_ROUTES.CALENDAR.TAGS.DELETE(id));
  },
};

export const calendarCategoriesService = {
  async getAllCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>(API_ROUTES.CATEGORIES.ALL);
    return response.data;
  },

  async createCategory(data: {
    name: string;
    color: string;
  }): Promise<Category> {
    const response = await api.post<Category>(
      API_ROUTES.CATEGORIES.CREATE,
      data
    );
    return response.data;
  },

  async deleteCategory(id: number): Promise<void> {
    await api.delete(API_ROUTES.CATEGORIES.DELETE(id));
  },
};
