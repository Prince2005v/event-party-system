import { useCart } from "@/hooks/use-cart";
import { useCreateBooking } from "@/hooks/use-bookings";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export default function Review() {
  const { items, isLoading, removeItem, totalPrice } = useCart();
  const { mutate: createBooking, isPending } = useCreateBooking();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      window.location.href = "/api/login";
      return;
    }
    
    createBooking(items.map(i => i.eventId), {
      onSuccess: () => setLocation("/booking-success")
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-4xl font-display font-bold mb-8">Review Selection</h1>

        {items.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
            <h3 className="text-2xl font-bold mb-4">Your selection is empty</h3>
            <p className="text-muted-foreground mb-8">Looks like you haven't picked any events yet.</p>
            <Link href="/explore">
              <Button size="lg" className="rounded-full">Start Exploring</Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* List */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-4 p-4 rounded-xl bg-card border border-white/5 hover:border-white/10 transition-colors group"
                  >
                    <div className="w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                      <img 
                        src={item.event.imageUrl} 
                        alt={item.event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold font-display text-lg">{item.event.title}</h3>
                          <span className="font-mono font-bold">${Number(item.event.basePrice).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">{item.event.category}</p>
                      </div>
                      <div className="flex justify-end">
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-sm text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors px-2 py-1 rounded hover:bg-white/5"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 p-6 rounded-2xl bg-card border border-white/10 shadow-xl">
                <h3 className="font-bold text-xl mb-6">Booking Summary</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Selected Events</span>
                    <span>{items.length}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>${totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="h-px bg-white/10 my-4" />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">${totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                {!isAuthenticated && (
                  <div className="mb-6 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0" />
                    <p className="text-xs text-yellow-200/80">
                      You'll need to sign in to complete this booking. Don't worry, your selection is saved.
                    </p>
                  </div>
                )}

                <Button 
                  size="lg" 
                  className="w-full font-bold rounded-xl h-12 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                  onClick={handleCheckout}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {isAuthenticated ? "Confirm Booking" : "Sign In to Book"}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
