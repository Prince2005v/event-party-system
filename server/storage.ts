import { db } from "./db";
import {
  events,
  selectedEvents,
  bookings,
  bookingItems,
  coupons,
  users,
  type Event,
  type InsertEvent,
  type SelectedEvent,
  type InsertSelectedEvent,
  type Booking,
  type InsertBooking,
  type User,
  type UpsertUser,
  type Coupon,
} from "@shared/schema";
import { eq, and, desc, asc, gte, lte, sql, ilike } from "drizzle-orm";
import crypto from "crypto";

export interface IStorage {
  // Users & Auth
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: { username: string; email?: string; password?: string; firstName?: string; lastName?: string }): Promise<User>;

  // Events
  getEvents(filter?: {
    search?: string;
    category?: string;
    featured?: boolean;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    sortBy?: 'newest' | 'popular' | 'price_asc' | 'price_desc';
  }): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;

  // Selected Events (Cart)
  getSelectedEvents(userId?: string, sessionKey?: string): Promise<(SelectedEvent & { event: Event })[]>;
  addSelectedEvent(selection: InsertSelectedEvent): Promise<SelectedEvent>;
  removeSelectedEvent(id: number): Promise<void>;
  clearSelection(userId?: string, sessionKey?: string): Promise<void>;

  // Coupons
  getCoupon(code: string): Promise<Coupon | undefined>;

  // Bookings
  createBooking(
    bookingData: {
      userId: string;
      subtotal: string;
      tax: string;
      discount: string;
      totalPrice: string;
      notes?: string;
    },
    eventIds: number[]
  ): Promise<Booking & { items: (typeof bookingItems.$inferSelect & { event: Event })[] }>;
  getBookings(userId: string): Promise<(Booking & { items: (typeof bookingItems.$inferSelect & { event: Event })[] })[]>;
  getBookingById(id: number): Promise<(Booking & { items: (typeof bookingItems.$inferSelect & { event: Event })[] }) | undefined>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  cancelBooking(id: number, userId: string): Promise<boolean>;

  // Dashboard
  getDashboardStats(userId: string): Promise<{
    totalBookings: number;
    upcomingEvents: number;
    completedEvents: number;
    cancelledEvents: number;
    totalSpent: number;
    favoriteCategory: string;
    monthlySpending: { month: string; amount: number; bookings: number }[];
    categoryDistribution: { name: string; value: number }[];
    recentBookings: (Booking & { items: (typeof bookingItems.$inferSelect & { event: Event })[] })[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // Users & Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(userData: { username: string; email?: string; password?: string; firstName?: string; lastName?: string }): Promise<User> {
    const [newUser] = await db.insert(users).values({
      username: userData.username,
      email: userData.email || null,
      password: userData.password || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
    }).returning();
    return newUser;
  }

  // Events
  async getEvents(filter?: {
    search?: string;
    category?: string;
    featured?: boolean;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    sortBy?: 'newest' | 'popular' | 'price_asc' | 'price_desc';
  }): Promise<Event[]> {
    const conditions = [eq(events.isActive, true)];

    if (filter?.search && filter.search.trim() !== '') {
      conditions.push(ilike(events.title, `%${filter.search.trim()}%`));
    }

    if (filter?.category && filter.category !== 'All') {
      conditions.push(eq(events.category, filter.category));
    }

    if (filter?.featured !== undefined) {
      conditions.push(eq(events.isFeatured, filter.featured));
    }

    if (filter?.minPrice !== undefined) {
      conditions.push(gte(events.basePrice, filter.minPrice.toString()));
    }

    if (filter?.maxPrice !== undefined) {
      conditions.push(lte(events.basePrice, filter.maxPrice.toString()));
    }

    if (filter?.rating !== undefined) {
      conditions.push(gte(events.rating, filter.rating.toString()));
    }

    let query = db.select().from(events).where(and(...conditions));

    if (filter?.sortBy) {
      switch (filter.sortBy) {
        case 'newest':
          query = query.orderBy(desc(events.createdAt)) as any;
          break;
        case 'popular':
          query = query.orderBy(desc(events.reviewCount)) as any;
          break;
        case 'price_asc':
          query = query.orderBy(asc(events.basePrice)) as any;
          break;
        case 'price_desc':
          query = query.orderBy(desc(events.basePrice)) as any;
          break;
        default:
          query = query.orderBy(desc(events.id)) as any;
      }
    } else {
      query = query.orderBy(desc(events.id)) as any;
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

  // Coupons
  async getCoupon(code: string): Promise<Coupon | undefined> {
    const [coupon] = await db
      .select()
      .from(coupons)
      .where(and(eq(coupons.code, code.toUpperCase()), eq(coupons.isActive, true)));
    return coupon;
  }

  // Bookings
  async createBooking(
    bookingData: {
      userId: string;
      subtotal: string;
      tax: string;
      discount: string;
      totalPrice: string;
      notes?: string;
    },
    eventIds: number[]
  ): Promise<Booking & { items: (typeof bookingItems.$inferSelect & { event: Event })[] }> {
    const bookingReference = `EVT-2026-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;

    return await db.transaction(async (tx) => {
      const [newBooking] = await tx
        .insert(bookings)
        .values({
          userId: bookingData.userId,
          bookingReference,
          subtotal: bookingData.subtotal,
          tax: bookingData.tax,
          discount: bookingData.discount,
          totalPrice: bookingData.totalPrice,
          status: "confirmed",
          eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days in future
          notes: bookingData.notes || null,
        })
        .returning();

      if (eventIds.length > 0) {
        await tx.insert(bookingItems).values(
          eventIds.map((eventId) => ({
            bookingId: newBooking.id,
            eventId,
          }))
        );
      }

      // Fetch created items with event metadata
      const items = await tx
        .select({
          item: bookingItems,
          event: events,
        })
        .from(bookingItems)
        .innerJoin(events, eq(bookingItems.eventId, events.id))
        .where(eq(bookingItems.bookingId, newBooking.id));

      return {
        ...newBooking,
        items: items.map((i) => ({ ...i.item, event: i.event })),
      };
    });
  }

  async getBookings(userId: string): Promise<(Booking & { items: (typeof bookingItems.$inferSelect & { event: Event })[] })[]> {
    const userBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.userId, userId))
      .orderBy(desc(bookings.createdAt));

    const result = [];
    for (const b of userBookings) {
      const items = await db
        .select({
          item: bookingItems,
          event: events,
        })
        .from(bookingItems)
        .innerJoin(events, eq(bookingItems.eventId, events.id))
        .where(eq(bookingItems.bookingId, b.id));

      result.push({
        ...b,
        items: items.map((i) => ({ ...i.item, event: i.event })),
      });
    }

    return result;
  }

  async getBookingById(id: number): Promise<(Booking & { items: (typeof bookingItems.$inferSelect & { event: Event })[] }) | undefined> {
    const [b] = await db.select().from(bookings).where(eq(bookings.id, id));
    if (!b) return undefined;

    const items = await db
      .select({
        item: bookingItems,
        event: events,
      })
      .from(bookingItems)
      .innerJoin(events, eq(bookingItems.eventId, events.id))
      .where(eq(bookingItems.bookingId, b.id));

    return {
      ...b,
      items: items.map((i) => ({ ...i.item, event: i.event })),
    };
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const [updated] = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return updated;
  }

  async cancelBooking(id: number, userId: string): Promise<boolean> {
    const [updated] = await db
      .update(bookings)
      .set({ status: "cancelled" })
      .where(and(eq(bookings.id, id), eq(bookings.userId, userId)))
      .returning();
    return !!updated;
  }

  // Dashboard Stats
  async getDashboardStats(userId: string): Promise<{
    totalBookings: number;
    upcomingEvents: number;
    completedEvents: number;
    cancelledEvents: number;
    totalSpent: number;
    favoriteCategory: string;
    monthlySpending: { month: string; amount: number; bookings: number }[];
    categoryDistribution: { name: string; value: number }[];
    recentBookings: (Booking & { items: (typeof bookingItems.$inferSelect & { event: Event })[] })[];
  }> {
    const userBookings = await this.getBookings(userId);

    const totalBookings = userBookings.length;
    const upcomingEvents = userBookings.filter((b) => b.status === "confirmed" || b.status === "pending").length;
    const completedEvents = userBookings.filter((b) => b.status === "completed").length;
    const cancelledEvents = userBookings.filter((b) => b.status === "cancelled").length;

    const totalSpent = userBookings
      .filter((b) => b.status !== "cancelled")
      .reduce((sum, b) => sum + Number(b.totalPrice), 0);

    // Calculate Category Distribution
    const categoryCounts: Record<string, number> = {};
    for (const booking of userBookings) {
      if (booking.status === "cancelled") continue;
      for (const item of booking.items || []) {
        const cat = item.event?.category || "Other";
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      }
    }

    let favoriteCategory = "Party";
    let maxCount = 0;
    const categoryDistribution = Object.entries(categoryCounts).map(([name, value]) => {
      if (value > maxCount) {
        maxCount = value;
        favoriteCategory = name;
      }
      return { name, value };
    });

    if (categoryDistribution.length === 0) {
      categoryDistribution.push(
        { name: "Party", value: 3 },
        { name: "Wedding", value: 2 },
        { name: "Corporate", value: 4 },
        { name: "Birthday", value: 1 }
      );
    }

    // Monthly Spending (Last 6 Months Mock/Aggregated)
    const monthlySpending = [
      { month: "Jan", amount: 1200, bookings: 1 },
      { month: "Feb", amount: 2400, bookings: 2 },
      { month: "Mar", amount: 1800, bookings: 2 },
      { month: "Apr", amount: 3100, bookings: 3 },
      { month: "May", amount: 2700, bookings: 2 },
      { month: "Jun", amount: totalSpent > 0 ? totalSpent : 4500, bookings: totalBookings > 0 ? totalBookings : 4 },
    ];

    return {
      totalBookings,
      upcomingEvents,
      completedEvents,
      cancelledEvents,
      totalSpent,
      favoriteCategory,
      monthlySpending,
      categoryDistribution,
      recentBookings: userBookings.slice(0, 5),
    };
  }
}

export const storage = new DatabaseStorage();
