import { useCart } from "@/hooks/use-cart";
import { useCreateBooking } from "@/hooks/use-bookings";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Trash2, ArrowRight, Loader2, AlertCircle, Tag, CheckCircle2, ShieldCheck, Ticket } from "lucide-react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Review() {
  const { items, isLoading, removeItem, totalPrice } = useCart();
  const { mutateAsync: createBooking, isPending } = useCreateBooking();
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedCode, setAppliedCode] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [notes, setNotes] = useState("");

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setIsValidatingCoupon(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode, subtotal: totalPrice }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        setDiscountPercent(json.data.discountPercent);
        setAppliedCode(json.data.code);
        toast({
          title: "Coupon Applied!",
          description: `You got ${json.data.discountPercent}% off your booking.`,
        });
      } else {
        toast({
          title: "Invalid Coupon",
          description: json.message || "Promo code could not be applied.",
          variant: "destructive",
        });
      }
    } catch (e) {
      toast({
        title: "Coupon Error",
        description: "Failed to validate coupon code.",
        variant: "destructive",
      });
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Calculations
  const discountAmount = (totalPrice * discountPercent) / 100;
  const taxableSubtotal = totalPrice - discountAmount;
  const taxAmount = taxableSubtotal * 0.18; // 18% Tax / GST
  const finalTotal = taxableSubtotal + taxAmount;

  const handleCheckout = async () => {
    try {
      const eventIds = items.map((i) => i.eventId);
      const newBooking = await createBooking({
        eventIds,
        promoCode: appliedCode || undefined,
        notes: notes.trim() || undefined,
      });

      setLocation(`/booking-success?id=${newBooking.id}&ref=${newBooking.bookingReference}`);
    } catch (err: any) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="mb-8 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-wider">
            <Ticket className="w-4 h-4" />
            Checkout & Confirmation
          </div>
          <h1 className="text-4xl font-display font-extrabold tracking-tight">Review Event Selection</h1>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-card/20 p-8">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <Tag className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-2xl font-bold font-display mb-2">Your Selection Cart is Empty</h3>
            <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-sm">
              Discover and select premier venue packages or entertainment setups before checkout.
            </p>
            <Link href="/explore">
              <Button size="lg" className="rounded-full px-8 bg-primary">
                Browse Marketplace
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Items List */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="flex gap-4 p-4 rounded-2xl bg-card border border-white/10 hover:border-white/20 transition-all shadow-md group"
                    >
                      <div className="w-28 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-muted relative">
                        <img src={item.event?.imageUrl} alt={item.event?.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-grow flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold font-display text-base text-white group-hover:text-primary transition-colors">
                              {item.event?.title}
                            </h3>
                            <span className="font-mono font-bold text-white text-base">
                              ${Number(item.event?.basePrice || 0).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{item.event?.category} • {item.event?.location || 'New York, NY'}</p>
                        </div>

                        <div className="flex justify-end">
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Event Special Notes / Instructions */}
              <div className="p-5 rounded-2xl bg-card/40 border border-white/10 space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Event Instructions / Special Requests (Optional)
                </label>
                <Textarea
                  placeholder="Mention dietary preferences, VIP seating arrangements, or custom setup notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="bg-background/50 border-white/10 text-sm focus:border-primary/50"
                  rows={3}
                />
              </div>
            </div>

            {/* Right Summary Sidebar */}
            <div className="lg:col-span-5">
              <div className="sticky top-24 p-6 rounded-3xl bg-card border border-white/10 shadow-2xl space-y-6">
                <h3 className="font-bold font-display text-xl border-b border-white/10 pb-4">Order Summary</h3>

                {/* Promo Code Form */}
                <form onSubmit={handleApplyCoupon} className="space-y-2">
                  <label className="text-xs font-semibold text-muted-foreground block">Promo Code</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Try: EVENTIFY10 or WELCOME20"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      className="bg-background/50 border-white/10 uppercase font-mono text-sm"
                    />
                    <Button type="submit" disabled={isValidatingCoupon || !promoCode.trim()} size="sm" variant="outline">
                      {isValidatingCoupon ? <Loader2 className="w-4 h-4 animate-spin" /> : "Apply"}
                    </Button>
                  </div>
                  {appliedCode && (
                    <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Code {appliedCode} applied ({discountPercent}% Off)
                    </p>
                  )}
                </form>

                {/* Pricing Breakdown */}
                <div className="space-y-3 text-sm pt-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Packages ({items.length})</span>
                    <span className="font-mono text-white">${totalPrice.toLocaleString()}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Discount ({discountPercent}%)</span>
                      <span className="font-mono">-${discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax / GST (18%)</span>
                    <span className="font-mono text-white">${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-white/10 my-2" />
                  <div className="flex justify-between text-lg font-bold text-white">
                    <span>Total Amount</span>
                    <span className="text-primary font-mono">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex gap-2.5 items-center">
                  <ShieldCheck className="w-5 h-5 text-primary flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Instant confirmation. Free cancellation up to 14 days before your event.
                  </p>
                </div>

                <Button
                  size="lg"
                  className="w-full font-bold rounded-2xl h-13 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 shadow-xl shadow-primary/25 text-white gap-2"
                  onClick={handleCheckout}
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Reservation...
                    </>
                  ) : (
                    <>
                      Confirm & Place Reservation
                      <ArrowRight className="w-5 h-5" />
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
