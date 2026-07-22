import { z } from 'zod';
import { events, selectedEvents, bookings, coupons } from './schema';

// ============================================
// SHARED ERROR SCHEMAS
// ============================================
export const errorSchemas = {
  validation: z.object({
    success: z.literal(false),
    message: z.string(),
    errors: z.array(z.string()).optional(),
  }),
  notFound: z.object({
    success: z.literal(false),
    message: z.string(),
  }),
  internal: z.object({
    success: z.literal(false),
    message: z.string(),
  }),
  unauthorized: z.object({
    success: z.literal(false),
    message: z.string(),
  }),
};

// ============================================
// API CONTRACT
// ============================================
export const api = {
  auth: {
    signup: {
      method: 'POST' as const,
      path: '/api/auth/signup',
    },
    login: {
      method: 'POST' as const,
      path: '/api/auth/login',
    },
    logout: {
      method: 'POST' as const,
      path: '/api/auth/logout',
    },
    me: {
      method: 'GET' as const,
      path: '/api/auth/me',
    },
  },
  events: {
    list: {
      method: 'GET' as const,
      path: '/api/events',
      input: z.object({
        search: z.string().optional(),
        category: z.string().optional(),
        featured: z.string().optional(), // 'true' or 'false'
        minPrice: z.string().optional(),
        maxPrice: z.string().optional(),
        rating: z.string().optional(),
        sortBy: z.enum(['newest', 'popular', 'price_asc', 'price_desc']).optional(),
      }).optional(),
    },
    get: {
      method: 'GET' as const,
      path: '/api/events/:id',
    },
  },
  selectedEvents: {
    list: {
      method: 'GET' as const,
      path: '/api/selected-events',
      input: z.object({
        sessionKey: z.string().optional(),
      }).optional(),
    },
    add: {
      method: 'POST' as const,
      path: '/api/selected-events',
      input: z.object({
        eventId: z.number(),
        sessionKey: z.string().optional(),
      }),
    },
    remove: {
      method: 'DELETE' as const,
      path: '/api/selected-events/:id',
    },
  },
  coupons: {
    validate: {
      method: 'POST' as const,
      path: '/api/coupons/validate',
      input: z.object({
        code: z.string(),
        subtotal: z.number(),
      }),
    },
  },
  bookings: {
    create: {
      method: 'POST' as const,
      path: '/api/bookings',
      input: z.object({
        eventIds: z.array(z.number()),
        promoCode: z.string().optional(),
        notes: z.string().optional(),
      }),
    },
    list: {
      method: 'GET' as const,
      path: '/api/bookings',
    },
    get: {
      method: 'GET' as const,
      path: '/api/bookings/:id',
    },
    updateStatus: {
      method: 'PATCH' as const,
      path: '/api/bookings/:id',
      input: z.object({
        status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
      }),
    },
    cancel: {
      method: 'DELETE' as const,
      path: '/api/bookings/:id',
    },
  },
  dashboard: {
    get: {
      method: 'GET' as const,
      path: '/api/dashboard',
    },
  },
};

// Re-export type definitions for convenience
export type { EventResponse, SelectedEventResponse, BookingResponse, DashboardStatsResponse } from './schema';

// Helper function to replace parameters in path
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
