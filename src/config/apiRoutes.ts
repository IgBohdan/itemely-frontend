/**
 * Centralized API Routes Configuration
 * All API endpoints should be defined here for easy maintenance and scaling
 */

export const API_ROUTES = {
  // Auth routes
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },

  // User routes
  USERS: {
    BASE: '/users',
    ALL: '/users',
    BY_ID: (id: number) => `/users/${id}`,
    ME: '/users/me',
    UPDATE: (id: number) => `/users/${id}`,
    UPDATE_ME: '/users/me',
    DELETE: (id: number) => `/users/${id}`,
  },

  // Category routes
  CATEGORIES: {
    BASE: '/categories',
    ALL: '/categories',
    CREATE: '/categories',
    DELETE: (id: number) => `/categories/${id}`,
  },

  // Legacy Events routes (old events module)
  EVENTS: {
    BASE: '/events',
    ALL: '/events',
    BY_ID: (id: number) => `/events/${id}`,
    CREATE: '/events',
    UPDATE: (id: number) => `/events/${id}`,
    DELETE: (id: number) => `/events/${id}`,
  },

  // Calendar Events routes (new calendar microservice)
  CALENDAR: {
    EVENTS: {
      BASE: '/calendar/events',
      ALL: '/calendar/events',
      GET: (id: number) => `/calendar/events/${id}`,
      CREATE: '/calendar/events',
      UPDATE: (id: number) => `/calendar/events/${id}`,
      DELETE: (id: number) => `/calendar/events/${id}`,
    },
    TAGS: {
      BASE: '/calendar/tags',
      ALL: '/calendar/tags',
      BY_ID: (id: number) => `/calendar/tags/${id}`,
      CREATE: '/calendar/tags',
      UPDATE: (id: number) => `/calendar/tags/${id}`,
      DELETE: (id: number) => `/calendar/tags/${id}`,
    },
    REMINDERS: {
      BASE: (eventId: number) => `/calendar/events/${eventId}/reminders`,
      ALL: (eventId: number) => `/calendar/events/${eventId}/reminders`,
      BY_ID: (eventId: number, id: number) =>
        `/calendar/events/${eventId}/reminders/${id}`,
      CREATE: (eventId: number) => `/calendar/events/${eventId}/reminders`,
      UPDATE: (eventId: number, id: number) =>
        `/calendar/events/${eventId}/reminders/${id}`,
      DELETE: (eventId: number, id: number) =>
        `/calendar/events/${eventId}/reminders/${id}`,
    },
    RECURRENCE: {
      BASE: (eventId: number) => `/calendar/events/${eventId}/recurrence`,
      GET: (eventId: number) => `/calendar/events/${eventId}/recurrence`,
      CREATE: (eventId: number) => `/calendar/events/${eventId}/recurrence`,
      UPDATE: (eventId: number) => `/calendar/events/${eventId}/recurrence`,
      DELETE: (eventId: number) => `/calendar/events/${eventId}/recurrence`,
    },
  },

  // Notifications routes
  NOTIFICATIONS: {
    BASE: '/notifications',
    ALL: '/notifications',
    MARK_AS_READ: (id: number) => `/notifications/${id}/read`,
  },

  // Activity Log routes
  ACTIVITY_LOG: {
    BASE: '/activity-log',
    ALL: '/activity-log',
  },
} as const;

