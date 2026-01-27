import { db } from "./db";
import {
  events,
  selectedEvents,
  bookings,
  bookingItems,
  type Event,
  type InsertEvent,
  type SelectedEvent,
  type InsertSelectedEvent,
  type Booking,
  type InsertBooking,
} from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Events
  getEvents(filter?: { category?: string; featured?: boolean }): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;

  // Selected Events (Cart)
  getSelectedEvents(userId?: string, sessionKey?: string): Promise<(SelectedEvent & { event: Event })[]>;
  addSelectedEvent(selection: InsertSelectedEvent): Promise<SelectedEvent>;
  removeSelectedEvent(id: number): Promise<void>;
  clearSelection(userId?: string, sessionKey?: string): Promise<void>;

  // Bookings
  createBooking(booking: InsertBooking, eventIds: number[]): Promise<Booking>;
  getBookings(userId: string): Promise<Booking[]>;
  getDashboardStats(userId: string): Promise<{
    totalBookings: number;
    totalSpent: number;
    recentBookings: Booking[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // Events
  async getEvents(filter?: { category?: string; featured?: boolean }): Promise<Event[]> {
    let query = db.select().from(events).where(eq(events.isActive, true));

    if (filter?.category) {
      query.where(eq(events.category, filter.category));
    }

    if (filter?.featured) {
      query.where(eq(events.isFeatured, true));
    }

    return await query;
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [newEvent] = await db.insert(events).values(event).returning();
    return newEvent;
  }

  // Selected Events
  async getSelectedEvents(userId?: string, sessionKey?: string): Promise<(SelectedEvent & { event: Event })[]> {
    if (!userId && !sessionKey) return [];

    const conditions = [];
    if (userId) conditions.push(eq(selectedEvents.userId, userId));
    if (sessionKey) conditions.push(eq(selectedEvents.sessionKey, sessionKey));

    // Logic: If both provided, we could merge or prefer user. 
    // For simplicity, if userId is present, we might want to also include session items or migrate them.
    // Here we strictly follow: get items matching EITHER user OR session (if logic requires merging) 
    // OR just use the specific key provided. 
    // Let's assume the caller handles the context. We'll match whatever is provided.
    
    // Simplest approach: Match exactly what is passed.
    const whereClause = userId 
      ? eq(selectedEvents.userId, userId) 
      : eq(selectedEvents.sessionKey, sessionKey!);

    const results = await db
      .select({
        selection: selectedEvents,
        event: events,
      })
      .from(selectedEvents)
      .innerJoin(events, eq(selectedEvents.eventId, events.id))
      .where(whereClause);

    return results.map((r) => ({ ...r.selection, event: r.event }));
  }

  async addSelectedEvent(selection: InsertSelectedEvent): Promise<SelectedEvent> {
    const [newSelection] = await db.insert(selectedEvents).values(selection).returning();
    return newSelection;
  }

  async removeSelectedEvent(id: number): Promise<void> {
    await db.delete(selectedEvents).where(eq(selectedEvents.id, id));
  }

  async clearSelection(userId?: string, sessionKey?: string): Promise<void> {
     const whereClause = userId 
      ? eq(selectedEvents.userId, userId) 
      : eq(selectedEvents.sessionKey, sessionKey!);
      
    await db.delete(selectedEvents).where(whereClause);
  }

  // Bookings
  async createBooking(booking: InsertBooking, eventIds: number[]): Promise<Booking> {
    // Transaction to ensure atomicity
    return await db.transaction(async (tx) => {
      const [newBooking] = await tx.insert(bookings).values(booking).returning();

      if (eventIds.length > 0) {
        await tx.insert(bookingItems).values(
          eventIds.map((eventId) => ({
            bookingId: newBooking.id,
            eventId,
          }))
        );
      }

      return newBooking;
    });
  }

  async getBookings(userId: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.userId, userId)).orderBy(desc(bookings.createdAt));
  }

  async getDashboardStats(userId: string): Promise<{
    totalBookings: number;
    totalSpent: number;
    recentBookings: Booking[];
  }> {
    const userBookings = await this.getBookings(userId);
    
    const totalSpent = userBookings.reduce((sum, b) => sum + Number(b.totalPrice), 0);

    return {
      totalBookings: userBookings.length,
      totalSpent,
      recentBookings: userBookings.slice(0, 5),
    };
  }
}

export const storage = new DatabaseStorage();
