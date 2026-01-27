import { z } from 'zod';
import { insertEventSchema, events, selectedEvents, bookings } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  events: {
    list: {
      method: 'GET' as const,
      path: '/api/events',
      input: z.object({
        category: z.string().optional(),
        featured: z.string().optional(), // 'true' or 'false'
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof events.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/events/:id',
      responses: {
        200: z.custom<typeof events.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
  },
  selectedEvents: {
    list: {
      method: 'GET' as const,
      path: '/api/selected-events',
      input: z.object({
        sessionKey: z.string().optional(),
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof selectedEvents.$inferSelect & { event: typeof events.$inferSelect }>()),
      },
    },
    add: {
      method: 'POST' as const,
      path: '/api/selected-events',
      input: z.object({
        eventId: z.number(),
        sessionKey: z.string().optional(),
      }),
      responses: {
        201: z.custom<typeof selectedEvents.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    remove: {
      method: 'DELETE' as const,
      path: '/api/selected-events/:id',
      input: z.object({
        sessionKey: z.string().optional(),
      }).optional(),
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  bookings: {
    create: {
      method: 'POST' as const,
      path: '/api/bookings',
      input: z.object({
        eventIds: z.array(z.number()),
      }),
      responses: {
        201: z.custom<typeof bookings.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/bookings',
      responses: {
        200: z.array(z.custom<typeof bookings.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
  },
  dashboard: {
    get: {
      method: 'GET' as const,
      path: '/api/dashboard',
      responses: {
        200: z.object({
          totalBookings: z.number(),
          totalSpent: z.number(),
          recentBookings: z.array(z.any()), // Simplified for now
        }),
        401: errorSchemas.unauthorized,
      },
    },
  },
};

// ============================================
// HELPER FUNCTIONS
// ============================================
export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
