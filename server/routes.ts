import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { registerUserSchema, loginUserSchema } from "@shared/schema";
import { z } from "zod";
import crypto from "crypto";

// Password Hashing Helper using Node native crypto (pbkdf2)
function hashPassword(password: string): string {
  const salt = "eventify_salt_2026";
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Helper to retrieve current authenticated userId from session or replit auth
  const getUserId = (req: Request): string | undefined => {
    if ((req.session as any)?.userId) {
      return (req.session as any).userId;
    }
    if ((req.user as any)?.claims?.sub) {
      return (req.user as any).claims.sub;
    }
    return undefined;
  };

  // Auth Middleware
  const requireAuth = (req: Request, res: Response, next: NextFunction) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please log in to proceed.",
      });
    }
    next();
  };

  // === Authentication API ===

  app.post(api.auth.signup.path, async (req, res) => {
    try {
      const data = registerUserSchema.parse(req.body);

      const existingUser = await storage.getUserByUsername(data.username);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username is already taken.",
        });
      }

      if (data.email) {
        const existingEmail = await storage.getUserByEmail(data.email);
        if (existingEmail) {
          return res.status(400).json({
            success: false,
            message: "Email is already registered.",
          });
        }
      }

      const user = await storage.createUser({
        username: data.username,
        email: data.email,
        password: hashPassword(data.password),
        firstName: data.firstName,
        lastName: data.lastName,
      });

      (req.session as any).userId = user.id;

      res.status(201).json({
        success: true,
        message: "User account created successfully.",
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: err.errors.map((e) => `${e.path.join(".")}: ${e.message}`),
        });
      }
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.post(api.auth.login.path, async (req, res) => {
    try {
      const data = loginUserSchema.parse(req.body);
      const user = await storage.getUserByUsername(data.username);

      if (!user || user.password !== hashPassword(data.password)) {
        return res.status(401).json({
          success: false,
          message: "Invalid username or password.",
        });
      }

      (req.session as any).userId = user.id;

      res.json({
        success: true,
        message: "Logged in successfully.",
        data: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: err.errors.map((e) => `${e.path.join(".")}: ${e.message}`),
        });
      }
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true, message: "Logged out successfully." });
    });
  });

  app.get(api.auth.me.path, async (req, res) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.json({ success: true, data: null });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.json({ success: true, data: null });
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        profileImageUrl: user.profileImageUrl,
      },
    });
  });

  // === Events API ===

  app.get(api.events.list.path, async (req, res) => {
    try {
      const { search, category, featured, minPrice, maxPrice, rating, sortBy } = req.query;

      const eventsList = await storage.getEvents({
        search: search as string,
        category: category as string,
        featured: featured ? Boolean(featured === "true") : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        rating: rating ? Number(rating) : undefined,
        sortBy: sortBy as any,
      });

      res.json({
        success: true,
        data: eventsList,
      });
    } catch (err) {
      res.status(500).json({ success: false, message: "Failed to fetch events" });
    }
  });

  app.get(api.events.get.path, async (req, res) => {
    const event = await storage.getEvent(Number(req.params.id));
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    res.json({ success: true, data: event });
  });

  // === Selected Events (Cart) API ===

  app.get(api.selectedEvents.list.path, async (req, res) => {
    const userId = getUserId(req);
    const sessionKey = req.query.sessionKey as string;

    if (!userId && !sessionKey) {
      return res.json({ success: true, data: [] });
    }

    const selections = await storage.getSelectedEvents(userId, sessionKey);
    res.json({ success: true, data: selections });
  });

  app.post(api.selectedEvents.add.path, async (req, res) => {
    try {
      const input = api.selectedEvents.add.input.parse(req.body);
      const userId = getUserId(req);

      const selection = await storage.addSelectedEvent({
        eventId: input.eventId,
        userId: userId || null,
        sessionKey: input.sessionKey || null,
      });

      res.status(201).json({ success: true, data: selection });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: err.errors[0].message,
        });
      }
      res.status(500).json({ success: false, message: "Failed to add event to cart" });
    }
  });

  app.delete(api.selectedEvents.remove.path, async (req, res) => {
    await storage.removeSelectedEvent(Number(req.params.id));
    res.status(200).json({ success: true, message: "Removed item from selection" });
  });

  // === Coupons API ===

  app.post(api.coupons.validate.path, async (req, res) => {
    try {
      const { code, subtotal } = api.coupons.validate.input.parse(req.body);
      const coupon = await storage.getCoupon(code);

      if (!coupon) {
        return res.status(404).json({
          success: false,
          message: "Invalid or expired promo code.",
        });
      }

      if (subtotal < Number(coupon.minSpend)) {
        return res.status(400).json({
          success: false,
          message: `Minimum spend of $${coupon.minSpend} required for code ${coupon.code}.`,
        });
      }

      const discountAmount = (subtotal * coupon.discountPercent) / 100;

      res.json({
        success: true,
        message: `Applied ${coupon.discountPercent}% discount!`,
        data: {
          code: coupon.code,
          discountPercent: coupon.discountPercent,
          discountAmount,
        },
      });
    } catch (err) {
      res.status(400).json({ success: false, message: "Invalid coupon request payload" });
    }
  });

  // === Bookings API ===

  app.post(api.bookings.create.path, async (req, res) => {
    try {
      const input = api.bookings.create.input.parse(req.body);
      const userId = getUserId(req) || "guest-user";

      let subtotal = 0;
      for (const eventId of input.eventIds) {
        const event = await storage.getEvent(eventId);
        if (event) {
          subtotal += Number(event.basePrice);
        }
      }

      let discountAmount = 0;
      if (input.promoCode) {
        const coupon = await storage.getCoupon(input.promoCode);
        if (coupon && subtotal >= Number(coupon.minSpend)) {
          discountAmount = (subtotal * coupon.discountPercent) / 100;
        }
      }

      const taxAmount = (subtotal - discountAmount) * 0.18; // 18% GST/Tax
      const totalPrice = subtotal - discountAmount + taxAmount;

      const booking = await storage.createBooking(
        {
          userId,
          subtotal: subtotal.toFixed(2),
          tax: taxAmount.toFixed(2),
          discount: discountAmount.toFixed(2),
          totalPrice: totalPrice.toFixed(2),
          notes: input.notes,
        },
        input.eventIds
      );

      // Clear selection after booking
      await storage.clearSelection(userId);

      res.status(201).json({
        success: true,
        message: "Booking created successfully!",
        data: booking,
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: err.errors[0].message,
        });
      }
      res.status(500).json({ success: false, message: "Failed to create booking" });
    }
  });

  app.get(api.bookings.list.path, async (req, res) => {
    const userId = getUserId(req) || "guest-user";
    const bookingsList = await storage.getBookings(userId);
    res.json({ success: true, data: bookingsList });
  });

  app.get(api.bookings.get.path, async (req, res) => {
    const booking = await storage.getBookingById(Number(req.params.id));
    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found" });
    }
    res.json({ success: true, data: booking });
  });

  app.patch(api.bookings.updateStatus.path, async (req, res) => {
    try {
      const { status } = api.bookings.updateStatus.input.parse(req.body);
      const updated = await storage.updateBookingStatus(Number(req.params.id), status);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Booking not found" });
      }
      res.json({ success: true, message: `Booking status updated to ${status}`, data: updated });
    } catch (err) {
      res.status(400).json({ success: false, message: "Invalid request payload" });
    }
  });

  app.delete(api.bookings.cancel.path, async (req, res) => {
    const userId = getUserId(req) || "guest-user";
    const success = await storage.cancelBooking(Number(req.params.id), userId);
    if (!success) {
      return res.status(404).json({ success: false, message: "Booking not found or already cancelled" });
    }
    res.json({ success: true, message: "Booking cancelled successfully" });
  });

  // === Dashboard API ===

  app.get(api.dashboard.get.path, async (req, res) => {
    const userId = getUserId(req) || "guest-user";
    const stats = await storage.getDashboardStats(userId);
    res.json({ success: true, data: stats });
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingEvents = await storage.getEvents();
  if (existingEvents.length === 0) {
    const eventsToSeed = [
      {
        title: "Sunset Rooftop Gala & Cocktail Party",
        description: "An exclusive evening with 360-degree skyline views, live DJ, premium open bar, and gourmet hors d'oeuvres. Ideal for high-end celebrations and networking.",
        category: "Party",
        basePrice: "1499.00",
        imageUrl: "https://images.unsplash.com/photo-1519671482549-109ecb2435a9?w=800&auto=format&fit=crop&q=80",
        rating: "4.90",
        reviewCount: 48,
        location: "Manhattan, NY",
        maxCapacity: 150,
        tags: "rooftop,luxury,cocktails,dj",
        isFeatured: true,
        isActive: true,
      },
      {
        title: "Grand Crystal Ballroom Wedding Package",
        description: "A breathtaking fairy-tale venue featuring high crystal chandeliers, customizable floral stages, white glove banqueting, and full audiovisual orchestration.",
        category: "Wedding",
        basePrice: "4999.00",
        imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0202128?w=800&auto=format&fit=crop&q=80",
        rating: "4.95",
        reviewCount: 82,
        location: "Beverly Hills, CA",
        maxCapacity: 350,
        tags: "wedding,ballroom,luxury,catering",
        isFeatured: true,
        isActive: true,
      },
      {
        title: "Corporate AI & Tech Leadership Summit",
        description: "State-of-the-art keynote hall setup with 4K LED displays, breakout rooms, high-speed fiber Wi-Fi, catered lunch, and VIP lounge.",
        category: "Corporate",
        basePrice: "3499.00",
        imageUrl: "https://images.unsplash.com/photo-1544531696-60c35eb8436e?w=800&auto=format&fit=crop&q=80",
        rating: "4.85",
        reviewCount: 36,
        location: "San Francisco, CA",
        maxCapacity: 500,
        tags: "tech,summit,corporate,keynote",
        isFeatured: true,
        isActive: true,
      },
      {
        title: "Boho Chic Garden Birthday Celebration",
        description: "Enchanting outdoor garden setting adorned with fairy string lights, cozy low-table seating, live acoustic musician, and custom cake bar.",
        category: "Birthday",
        basePrice: "899.00",
        imageUrl: "https://images.unsplash.com/photo-1530103862676-de3c9a59af38?w=800&auto=format&fit=crop&q=80",
        rating: "4.78",
        reviewCount: 29,
        location: "Austin, TX",
        maxCapacity: 75,
        tags: "garden,boho,birthday,outdoor",
        isFeatured: false,
        isActive: true,
      },
      {
        title: "Modern Art Gallery & Fashion Launch",
        description: "Sleek minimalist white-box gallery with customizable spotlighting, runway space, sound system, and champagne reception counter.",
        category: "Corporate",
        basePrice: "2199.00",
        imageUrl: "https://images.unsplash.com/photo-1478147427282-58a87a120781?w=800&auto=format&fit=crop&q=80",
        rating: "4.88",
        reviewCount: 19,
        location: "SoHo, NY",
        maxCapacity: 200,
        tags: "fashion,art,launch,minimalist",
        isFeatured: false,
        isActive: true,
      },
      {
        title: "Neon Beachside Music Festival Stage",
        description: "Vibrant beachside setup complete with heavy bass acoustic rig, laser lights, pyro elements, and VIP cabana enclosures.",
        category: "Concert",
        basePrice: "5999.00",
        imageUrl: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&auto=format&fit=crop&q=80",
        rating: "4.92",
        reviewCount: 64,
        location: "Miami Beach, FL",
        maxCapacity: 1000,
        tags: "concert,festival,beach,neon",
        isFeatured: true,
        isActive: true,
      },
    ];

    for (const event of eventsToSeed) {
      await storage.createEvent(event as any);
    }
    console.log("Database seeded with events.");
  }

  // Seed Coupons if missing
  const testCoupon = await storage.getCoupon("EVENTIFY10");
  if (!testCoupon) {
    try {
      const { db } = await import("./db");
      const { coupons } = await import("@shared/schema");
      await db.insert(coupons).values([
        { code: "EVENTIFY10", discountPercent: 10, minSpend: "100.00" },
        { code: "WELCOME20", discountPercent: 20, minSpend: "500.00" },
        { code: "VIP30", discountPercent: 30, minSpend: "1000.00" },
      ]);
      console.log("Database seeded with promo coupons.");
    } catch (e) {
      // ignore seed error if already present
    }
  }
}
