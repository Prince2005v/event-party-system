import { type Event } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, Plus, Loader2 } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const { addItem, removeItem, isSelected, getSelectionId } = useCart();
  const selected = isSelected(event.id);
  const selectionId = getSelectionId(event.id);

  const handleToggle = () => {
    if (selected && selectionId) {
      removeItem(selectionId);
    } else {
      addItem(event.id);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      <Card className="group relative overflow-hidden border border-white/5 bg-card/40 backdrop-blur-sm hover:border-primary/50 transition-all duration-300 rounded-2xl h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-muted">
          <img 
            src={event.imageUrl} 
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
          
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 rounded-full bg-background/80 backdrop-blur-md text-xs font-semibold border border-white/10 uppercase tracking-wider text-muted-foreground">
              {event.category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow relative">
          <h3 className="text-xl font-bold font-display mb-2 group-hover:text-primary transition-colors line-clamp-1">
            {event.title}
          </h3>
          <p className="text-muted-foreground text-sm mb-6 line-clamp-2 flex-grow">
            {event.description}
          </p>
          
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground uppercase tracking-wider">Starting at</span>
              <span className="text-lg font-bold text-white font-mono">${Number(event.basePrice).toLocaleString()}</span>
            </div>
            
            <Button
              onClick={handleToggle}
              size="sm"
              variant={selected ? "secondary" : "default"}
              className={cn(
                "rounded-full transition-all duration-300",
                selected 
                  ? "bg-green-500/20 text-green-400 hover:bg-green-500/30 hover:text-green-300 border border-green-500/20" 
                  : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/25 hover:shadow-primary/40"
              )}
            >
              {selected ? (
                <>
                  <Check className="w-4 h-4 mr-1.5" />
                  Selected
                </>
              ) : (
                <>
                  Select
                  <Plus className="w-4 h-4 ml-1.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
