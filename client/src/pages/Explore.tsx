import { useState, useMemo } from "react";
import { useEvents } from "@/hooks/use-events";
import { EventCard } from "@/components/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, SlidersHorizontal, ArrowUpDown, X, Sparkles } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

const CATEGORIES = ["All", "Party", "Wedding", "Corporate", "Birthday", "Concert"];

export default function Explore() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState<number>(6000);
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'price_asc' | 'price_desc'>("popular");

  const { data: events = [], isLoading } = useEvents({
    search: search.trim() !== "" ? search : undefined,
    category: activeCategory !== "All" ? activeCategory : undefined,
    maxPrice,
    sortBy,
  });

  const clearFilters = () => {
    setSearch("");
    setActiveCategory("All");
    setMaxPrice(6000);
    setSortBy("popular");
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Curated Marketplace
          </div>
          <h1 className="text-4xl md:text-5xl font-display font-extrabold tracking-tight">Explore Event Packages</h1>
          <p className="text-muted-foreground text-base max-w-2xl">
            Browse and filter through luxury venues, rooftop galas, wedding ballrooms, and corporate summit setups.
          </p>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="sticky top-16 z-30 bg-card/90 backdrop-blur-xl p-4 md:p-6 rounded-3xl border border-white/10 shadow-2xl mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <div className="relative md:col-span-6">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search packages by title, venue, or keyword..."
                className="pl-10 bg-background/50 border-white/10 focus:border-primary/50 rounded-2xl h-11"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Price Filter Slider */}
            <div className="md:col-span-3 space-y-1.5 px-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Max Price</span>
                <span className="text-primary font-mono">${maxPrice.toLocaleString()}</span>
              </div>
              <Slider
                value={[maxPrice]}
                min={500}
                max={6000}
                step={250}
                onValueChange={(val) => setMaxPrice(val[0])}
                className="py-1 cursor-pointer"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="md:col-span-3">
              <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
                <SelectTrigger className="bg-background/50 border-white/10 rounded-2xl h-11">
                  <div className="flex items-center gap-2 text-sm">
                    <ArrowUpDown className="w-4 h-4 text-primary" />
                    <SelectValue placeholder="Sort By" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10">
                  <SelectItem value="popular">Popularity & Rating</SelectItem>
                  <SelectItem value="newest">Newest Listed</SelectItem>
                  <SelectItem value="price_asc">Price: Low to High</SelectItem>
                  <SelectItem value="price_desc">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Category Tabs Row */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 scrollbar-hide">
            <span className="text-xs font-bold text-muted-foreground uppercase mr-2 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" />
              Category:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`
                  px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap
                  ${activeCategory === cat
                    ? "bg-primary text-white shadow-md shadow-primary/30"
                    : "bg-white/5 text-muted-foreground hover:bg-white/10 hover:text-white border border-white/5"}
                `}
              >
                {cat}
              </button>
            ))}

            {(search || activeCategory !== "All" || maxPrice < 6000) && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs text-destructive hover:bg-destructive/10 ml-auto">
                Reset Filters
              </Button>
            )}
          </div>
        </div>

        {/* Event Cards Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-[380px] bg-white/5 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-card/20 rounded-3xl border border-white/5">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <Filter className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold font-display mb-2">No matching events found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto text-sm mb-6">
              Try adjusting your search terms or increasing your price filter limit.
            </p>
            <Button variant="outline" onClick={clearFilters} className="rounded-full px-6">
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
