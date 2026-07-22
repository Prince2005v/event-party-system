import { type Event } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Plus, Star, MapPin, Users, Heart, Eye } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const { addItem, removeItem, isSelected, getSelectionId } = useCart();
  const selected = isSelected(event.id);
  const selectionId = getSelectionId(event.id);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const handleToggle = () => {
    if (selected && selectionId) {
      removeItem(selectionId);
    } else {
      addItem(event.id);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="h-full"
      >
        <Card className="group relative overflow-hidden border border-white/10 bg-card/40 backdrop-blur-md hover:border-primary/50 hover:shadow-xl hover:shadow-primary/10 transition-all duration-300 rounded-2xl h-full flex flex-col">
          {/* Image Container */}
          <div className="relative aspect-[16/10] overflow-hidden bg-muted">
            <img
              src={event.imageUrl}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-90" />

            {/* Top Badges */}
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
              <span className="px-3 py-1 rounded-full bg-background/80 backdrop-blur-md text-xs font-semibold border border-white/15 uppercase tracking-wider text-primary">
                {event.category}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsWishlisted(!isWishlisted);
                }}
                className={cn(
                  "w-8 h-8 rounded-full bg-background/80 backdrop-blur-md flex items-center justify-center border border-white/15 transition-all hover:scale-110",
                  isWishlisted ? "text-red-500 fill-red-500" : "text-muted-foreground hover:text-white"
                )}
              >
                <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
              </button>
            </div>

            {/* Quick View Floating Button */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setQuickViewOpen(true)}
                className="gap-2 rounded-full shadow-lg bg-background/90 hover:bg-background"
              >
                <Eye className="w-4 h-4 text-primary" />
                Quick View
              </Button>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 flex flex-col flex-grow relative">
            {/* Rating & Location info */}
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <div className="flex items-center gap-1 text-amber-400 font-semibold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{event.rating || "4.8"}</span>
                <span className="text-muted-foreground">({event.reviewCount || 24})</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span className="truncate max-w-[120px]">{event.location || "New York, NY"}</span>
              </div>
            </div>

            <h3 className="text-lg font-bold font-display text-white mb-2 group-hover:text-primary transition-colors line-clamp-1">
              {event.title}
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed mb-4 line-clamp-2 flex-grow">
              {event.description}
            </p>

            {/* Footer Row */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-auto">
              <div>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Starting Price</span>
                <span className="text-lg font-bold text-white font-mono">${Number(event.basePrice).toLocaleString()}</span>
              </div>

              <Button
                onClick={handleToggle}
                size="sm"
                className={cn(
                  "rounded-full transition-all duration-300 gap-1.5",
                  selected
                    ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                    : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md shadow-primary/20"
                )}
              >
                {selected ? (
                  <>
                    <Check className="w-4 h-4" />
                    Selected
                  </>
                ) : (
                  <>
                    Add
                    <Plus className="w-4 h-4" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Quick View Modal */}
      <Dialog open={quickViewOpen} onOpenChange={setQuickViewOpen}>
        <DialogContent className="sm:max-w-[550px] bg-card border-white/10 p-0 overflow-hidden">
          <div className="relative aspect-[16/9] w-full">
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase">
                {event.category}
              </span>
              <div className="flex items-center gap-1 text-amber-400 text-sm font-bold">
                <Star className="w-4 h-4 fill-current" />
                {event.rating || "4.8"} ({event.reviewCount || 24} reviews)
              </div>
            </div>

            <DialogHeader>
              <DialogTitle className="text-2xl font-bold font-display">{event.title}</DialogTitle>
            </DialogHeader>

            <p className="text-muted-foreground text-sm leading-relaxed">{event.description}</p>

            <div className="grid grid-cols-2 gap-4 py-2 border-y border-white/10 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                <span>{event.location || "New York, NY"}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="w-4 h-4 text-primary" />
                <span>Capacity up to {event.maxCapacity || 150} guests</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <span className="text-xs text-muted-foreground block">Package Base Rate</span>
                <span className="text-2xl font-extrabold text-white font-mono">${Number(event.basePrice).toLocaleString()}</span>
              </div>
              <Button
                onClick={() => {
                  handleToggle();
                  setQuickViewOpen(false);
                }}
                className={cn("rounded-full px-6", selected ? "bg-emerald-600 hover:bg-emerald-700" : "bg-primary")}
              >
                {selected ? "In Your Selection" : "Add Package to Cart"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
