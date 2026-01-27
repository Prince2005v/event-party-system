import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // === Events API ===
  
  app.get(api.events.list.path, async (req, res) => {
    const category = req.query.category as string | undefined;
    
    const events = await storage.getEvents({ 
      category, 
      featured: req.query.featured ? Boolean(req.query.featured === 'true') : undefined 
    });
    res.json(events);
  });

  app.get(api.events.get.path, async (req, res) => {
    const event = await storage.getEvent(Number(req.params.id));
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  });

  // === Selected Events (Cart) API ===

  app.get(api.selectedEvents.list.path, async (req, res) => {
    // User ID from auth or Session Key from query
    const userId = (req.user as any)?.claims?.sub; // Replit Auth ID
    const sessionKey = req.query.sessionKey as string;

    if (!userId && !sessionKey) {
      return res.json([]); 
    }

    const selections = await storage.getSelectedEvents(userId, sessionKey);
    res.json(selections);
  });

  app.post(api.selectedEvents.add.path, async (req, res) => {
    try {
      const input = api.selectedEvents.add.input.parse(req.body);
      const userId = (req.user as any)?.claims?.sub;

      const selection = await storage.addSelectedEvent({
        eventId: input.eventId,
        userId: userId || null,
        sessionKey: input.sessionKey || null,
      });

      res.status(201).json(selection);
    } catch (err) {
       if (err instanceof z.ZodError) {
          return res.status(400).json({
            message: err.errors[0].message,
            field: err.errors[0].path.join('.'),
          });
        }
        throw err;
    }
  });

  app.delete(api.selectedEvents.remove.path, async (req, res) => {
    // Ideally check ownership here, but for MVP we assume ID is sufficient or check DB
    await storage.removeSelectedEvent(Number(req.params.id));
    res.status(204).send();
  });


  // === Bookings API ===

  app.post(api.bookings.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = api.bookings.create.input.parse(req.body);
      const userId = (req.user as any)?.claims?.sub;

      // Calculate total price (in a real app, verify prices from DB)
      let totalPrice = 0;
      for (const eventId of input.eventIds) {
        const event = await storage.getEvent(eventId);
        if (event) {
          totalPrice += Number(event.basePrice);
        }
      }

      const booking = await storage.createBooking({
        userId,
        totalPrice: totalPrice.toString(), // Store as string decimal
        status: 'confirmed', // Auto-confirm for now
      }, input.eventIds);

      // Clear selection after booking
      await storage.clearSelection(userId);

      res.status(201).json(booking);
    } catch (err) {
       if (err instanceof z.ZodError) {
          return res.status(400).json({
            message: err.errors[0].message,
            field: err.errors[0].path.join('.'),
          });
        }
        throw err;
    }
  });

  app.get(api.bookings.list.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any)?.claims?.sub;
    const bookings = await storage.getBookings(userId);
    res.json(bookings);
  });

  app.get(api.dashboard.get.path, isAuthenticated, async (req, res) => {
    const userId = (req.user as any)?.claims?.sub;
    const stats = await storage.getDashboardStats(userId);
    res.json(stats);
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
        title: "Sunset Rooftop Party",
        description: "An exclusive evening with panoramic views, live DJ, and gourmet cocktails. Perfect for networking or celebration.",
        category: "Party",
        basePrice: "1500.00",
        imageUrl: "https://images.unsplash.com/photo-1519671482549-109ecb2435a9?w=800&auto=format&fit=crop&q=60",
        isFeatured: true,
        isActive: true,
      },
      {
        title: "Grand Ballroom Wedding",
        description: "A fairy-tale wedding venue with crystal chandeliers, elegant seating, and full-service catering.",
        category: "Wedding",
        basePrice: "5000.00",
        imageUrl: "https://images.unsplash.com/photo-1519225421980-715cb0202128?w=800&auto=format&fit=crop&q=60",
        isFeatured: true,
        isActive: true,
      },
      {
        title: "Corporate Tech Summit",
        description: "Professional conference setup with main stage, breakout rooms, and high-speed AV equipment.",
        category: "Corporate",
        basePrice: "3500.00",
        imageUrl: "https://images.unsplash.com/photo-1544531696-60c35eb8436e?w=800&auto=format&fit=crop&q=60",
        isFeatured: true,
        isActive: true,
      },
      {
        title: "Garden Birthday Bash",
        description: "Intimate outdoor setting with floral decorations, string lights, and cozy seating arrangements.",
        category: "Birthday",
        basePrice: "800.00",
        imageUrl: "https://images.unsplash.com/photo-1530103862676-de3c9a59af38?w=800&auto=format&fit=crop&q=60",
        isFeatured: false,
        isActive: true,
      },
      {
        title: "Art Gallery Launch",
        description: "Minimalist and chic venue perfect for showcasing art, fashion, or product launches.",
        category: "Corporate",
        basePrice: "2000.00",
        imageUrl: "https://images.unsplash.com/photo-1478147427282-58a87a120781?w=800&auto=format&fit=crop&q=60",
        isFeatured: false,
        isActive: true,
      },
    ];

    for (const event of eventsToSeed) {
      await storage.createEvent(event as any);
    }
    console.log("Database seeded with initial events.");
  }
}
