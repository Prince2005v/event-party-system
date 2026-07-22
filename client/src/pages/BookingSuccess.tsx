import { Button } from "@/components/ui/button";
import { Link, useSearch } from "wouter";
import { CheckCircle2, ArrowRight, Download, Printer, Share2, Mail, Calendar, LayoutDashboard, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import ReactCanvasConfetti from "react-canvas-confetti";
import { useRef, useCallback } from "react";

export default function BookingSuccess() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const bookingId = params.get("id") || "1001";
  const bookingRef = params.get("ref") || "EVT-2026-83JK92";

  const onInitHandler = useCallback(({ confetti }: { confetti: any }) => {
    if (confetti) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.5 },
      });
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen pt-24 pb-20 flex items-center justify-center p-4 relative overflow-hidden bg-background">
      <ReactCanvasConfetti
        style={{
          position: "fixed",
          pointerEvents: "none",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          zIndex: 50,
        }}
        onInit={onInitHandler}
      />

      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[140px] pointer-events-none -z-10" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="max-w-lg w-full text-center relative z-10 p-8 md:p-10 rounded-3xl bg-card border border-white/10 shadow-2xl backdrop-blur-2xl space-y-6"
      >
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10 animate-bounce">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Reservation Confirmed
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-extrabold text-white">Booking Complete!</h1>
          <p className="text-muted-foreground text-sm mt-2 max-w-sm mx-auto">
            Your event package reservation has been locked in. A confirmation email has been dispatched.
          </p>
        </div>

        {/* Receipt Card */}
        <div className="p-5 rounded-2xl bg-background/60 border border-white/10 text-left space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-white/10">
            <span className="text-muted-foreground uppercase font-sans font-semibold">Booking Reference</span>
            <span className="text-primary font-bold text-sm">{bookingRef}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-sans">Booking ID:</span>
            <span className="text-white">#{bookingId}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-sans">Payment Status:</span>
            <span className="text-emerald-400 font-bold font-sans">PAID / CONFIRMED</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-muted-foreground font-sans">QR Verification Code:</span>
            {/* SVG QR Code Simulation */}
            <div className="w-12 h-12 bg-white p-1 rounded border">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-full h-full text-black">
                <rect x="2" y="2" width="8" height="8" strokeWidth="2" />
                <rect x="14" y="2" width="8" height="8" strokeWidth="2" />
                <rect x="2" y="14" width="8" height="8" strokeWidth="2" />
                <rect x="14" y="14" width="4" height="4" fill="currentColor" />
                <rect x="18" y="18" width="4" height="4" fill="currentColor" />
              </svg>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-3">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 rounded-xl border-white/10">
            <Printer className="w-4 h-4 text-primary" />
            Print Receipt
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigator.clipboard?.writeText(bookingRef)} className="gap-2 rounded-xl border-white/10">
            <Share2 className="w-4 h-4 text-purple-400" />
            Copy Code
          </Button>
        </div>

        <div className="space-y-3 pt-2">
          <Link href="/dashboard">
            <Button className="w-full h-12 rounded-2xl text-base font-bold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white gap-2 shadow-xl shadow-primary/20">
              <LayoutDashboard className="w-5 h-5" />
              Go to Dashboard Analytics
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="ghost" className="w-full h-11 rounded-2xl text-muted-foreground hover:text-white">
              Continue Browsing Marketplace
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
