import { pgTable, text, serial, integer, boolean, timestamp, varchar, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

// Re-export auth models
export * from "./models/auth";

// === TABLE DEFINITIONS ===

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // Party, Wedding, Birthday, Corporate, etc.
  basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url").notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const selectedEvents = pgTable("selected_events", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id), // Nullable for guests
  eventId: integer("event_id").notNull().references(() => events.id),
  sessionKey: text("session_key"), // For guests
  selectedAt: timestamp("selected_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // pending, confirmed, cancelled
  bookingReference: text("booking_reference").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookingItems = pgTable("booking_items", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").notNull().references(() => bookings.id),
  eventId: integer("event_id").notNull().references(() => events.id),
});

// === RELATIONS ===

export const eventsRelations = relations(events, ({ many }) => ({
  selections: many(selectedEvents),
  bookingItems: many(bookingItems),
}));

export const selectedEventsRelations = relations(selectedEvents, ({ one }) => ({
  event: one(events, {
    fields: [selectedEvents.eventId],
    references: [events.id],
  }),
  user: one(users, {
    fields: [selectedEvents.userId],
    references: [users.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  items: many(bookingItems),
}));

export const bookingItemsRelations = relations(bookingItems, ({ one }) => ({
  booking: one(bookings, {
    fields: [bookingItems.bookingId],
    references: [bookings.id],
  }),
  event: one(events, {
    fields: [bookingItems.eventId],
    references: [events.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertEventSchema = createInsertSchema(events).omit({ 
  id: true, 
  createdAt: true 
});

export const insertSelectedEventSchema = createInsertSchema(selectedEvents).omit({ 
  id: true, 
  selectedAt: true 
});

export const insertBookingSchema = createInsertSchema(bookings).omit({ 
  id: true, 
  bookingReference: true,
  createdAt: true 
});

// === EXPLICIT API CONTRACT TYPES ===

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type SelectedEvent = typeof selectedEvents.$inferSelect & { event?: Event };
export type InsertSelectedEvent = z.infer<typeof insertSelectedEventSchema>;

export type Booking = typeof bookings.$inferSelect & { items?: (typeof bookingItems.$inferSelect & { event?: Event })[] };
export type InsertBooking = z.infer<typeof insertBookingSchema>;

// Request Types
export type CreateEventRequest = InsertEvent;
export type SelectEventRequest = { eventId: number; sessionKey?: string };
export type CreateBookingRequest = { eventIds: number[] }; // Simplified: create booking from selected IDs

// Response Types
export type EventResponse = Event;
export type SelectedEventResponse = SelectedEvent;
export type BookingResponse = Booking;
export type DashboardStatsResponse = {
  totalBookings: number;
  totalSpent: number;
  recentBookings: Booking[];
};
