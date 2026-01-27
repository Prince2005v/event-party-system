import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/hooks/use-events";
import { EventCard } from "@/components/EventCard";
import { ArrowRight, Star, Calendar, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const { data: featuredEvents = [], isLoading } = useEvents({ featured: true });

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-20 translate-x-1/2 -translate-y-1/2 animate-pulse" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[100px] opacity-20 -translate-x-1/4 translate-y-1/4" />
        </div>

        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-7xl font-display font-extrabold mb-6 leading-tight">
              Create events that are <br/>
              <span className="text-gradient-primary">simply unforgettable</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              From intimate gatherings to grand celebrations, discover and book curated experiences effortlessly.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/explore">
                <Button size="lg" className="rounded-full px-8 h-14 text-lg bg-white text-black hover:bg-gray-200 shadow-xl shadow-white/10 hover:shadow-white/20 transition-all">
                  Explore Events
                </Button>
              </Link>
              <Link href="/api/login">
                <Button size="lg" variant="outline" className="rounded-full px-8 h-14 text-lg border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 text-white">
                  Start Planning
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 border-y border-white/5 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Feature 
              icon={<Star className="w-6 h-6 text-yellow-400" />}
              title="Curated Selection"
              description="Only the highest quality vendors and venues make it to our platform."
            />
            <Feature 
              icon={<Calendar className="w-6 h-6 text-primary" />}
              title="Seamless Booking"
              description="Plan your entire event in minutes with our intuitive booking flow."
            />
            <Feature 
              icon={<Shield className="w-6 h-6 text-green-400" />}
              title="Secure Payments"
              description="Your transactions are protected with enterprise-grade security."
            />
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-display font-bold mb-2">Trending Experiences</h2>
              <p className="text-muted-foreground">Handpicked for your next big moment</p>
            </div>
            <Link href="/explore">
              <Button variant="ghost" className="hidden md:flex group hover:bg-white/5">
                View all
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[400px] bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
          
          <div className="mt-12 text-center md:hidden">
             <Link href="/explore">
              <Button className="w-full" variant="outline">Explore All Events</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function Feature({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="p-8 rounded-2xl bg-card border border-white/5 hover:border-white/10 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold font-display mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}
