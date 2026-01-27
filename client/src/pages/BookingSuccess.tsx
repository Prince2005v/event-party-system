import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Confetti from "react-canvas-confetti";

export default function BookingSuccess() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <Confetti
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none"
        }}
        fire={true}
        particleCount={100}
        spread={100}
        origin={{ y: 0.6 }}
      />
      
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background z-0" />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="max-w-md w-full text-center relative z-10 p-8 rounded-3xl bg-card border border-white/10 shadow-2xl backdrop-blur-xl"
      >
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400 border border-green-500/20 shadow-inner shadow-green-500/10">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-display font-bold mb-2">Booking Confirmed!</h1>
        <p className="text-muted-foreground mb-8">
          Thank you for choosing Eventify. Your events have been secured. We've sent a confirmation email with all the details.
        </p>
        
        <div className="space-y-3">
          <Link href="/dashboard">
            <Button className="w-full h-12 rounded-xl text-md font-semibold bg-white text-black hover:bg-gray-200">
              Go to Dashboard
            </Button>
          </Link>
          <Link href="/">
            <Button variant="ghost" className="w-full h-12 rounded-xl">
              Back to Home
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
