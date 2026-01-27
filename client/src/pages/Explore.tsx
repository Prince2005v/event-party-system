import { useState } from "react";
import { useEvents } from "@/hooks/use-events";
import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Filter } from "lucide-react";
import { motion } from "framer-motion";

const CATEGORIES = ["All", "Party", "Wedding", "Corporate", "Workshop", "Dining"];

export default function Explore() {
  const [activeCategory, setActiveCategory] = useState("All");
  const { data: events = [], isLoading } = useEvents(
    activeCategory !== "All" ? { category: activeCategory } : undefined
  );

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <div className="mb-12">
          <h1 className="text-4xl font-display font-bold mb-4">Explore Events</h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Discover the perfect additions to your upcoming event. Filter by category to find exactly what you need.
          </p>
        </div>

        {/* Filters & Search */}
        <div className="sticky top-16 z-30 bg-background/95 backdrop-blur-xl py-4 mb-8 -mx-4 px-4 border-b border-white/5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap
                  ${activeCategory === cat 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white"}
                `}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search events..." 
              className="pl-10 bg-white/5 border-white/10 focus:border-primary/50 transition-all rounded-full"
            />
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-32">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
              <Filter className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No events found</h3>
            <p className="text-muted-foreground">Try adjusting your category filter.</p>
            <Button 
              variant="link" 
              onClick={() => setActiveCategory("All")}
              className="mt-4 text-primary"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
