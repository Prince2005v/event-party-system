import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useEvents } from "@/hooks/use-events";
import { EventCard } from "@/components/EventCard";
import { ArrowRight, Star, Calendar, Shield, Sparkles, Award, HeartHandshake, CheckCircle2, ChevronDown, Music, Wine, Gift, Building2, PartyPopper } from "lucide-react";
import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Footer } from "@/components/Footer";

export default function Home() {
  const { data: featuredEvents = [], isLoading } = useEvents({ featured: true });

  const categories = [
    { name: "Parties & Galas", icon: <Wine className="w-6 h-6 text-pink-400" />, count: "120+ Packages", color: "from-pink-500/20 to-purple-500/20" },
    { name: "Luxury Weddings", icon: <HeartHandshake className="w-6 h-6 text-purple-400" />, count: "85+ Packages", color: "from-purple-500/20 to-indigo-500/20" },
    { name: "Corporate Summits", icon: <Building2 className="w-6 h-6 text-blue-400" />, count: "150+ Packages", color: "from-blue-500/20 to-cyan-500/20" },
    { name: "Birthday Bashes", icon: <PartyPopper className="w-6 h-6 text-amber-400" />, count: "90+ Packages", color: "from-amber-500/20 to-orange-500/20" },
    { name: "Concerts & Festivals", icon: <Music className="w-6 h-6 text-emerald-400" />, count: "60+ Packages", color: "from-emerald-500/20 to-teal-500/20" },
  ];

  const testimonials = [
    {
      name: "Sophia Martinez",
      role: "VP of Events, TechCorp",
      content: "Eventify-Planner handled our 500-person AI Summit flawlessly. The venue booking and vendor coordination was completely seamless!",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    },
    {
      name: "Marcus & Elena Vance",
      role: "Married in Beverly Hills",
      content: "Our dream ballroom wedding was brought to life without a single hiccup. The transparent pricing and luxury catalog exceeded our expectations.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    },
    {
      name: "David Chen",
      role: "Creative Director",
      content: "The easiest, most beautiful event planning UI I've ever used. From rooftop galas to art launches, Eventify is our go-to solution.",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    },
  ];

  const faqs = [
    {
      q: "How does booking work on Eventify-Planner?",
      a: "Simply browse our curated catalog of event packages, customize your selection into your cart, and complete checkout. Our concierges will immediately confirm availability with vendors.",
    },
    {
      q: "Can I customize packages or add custom requests?",
      a: "Yes! You can add special notes during checkout, or coordinate directly with our team to add custom catering, entertainment, and decor elements.",
    },
    {
      q: "What is the cancellation policy?",
      a: "Full refunds are provided for cancellations made up to 14 days prior to the event date. You can manage or cancel reservations directly from your User Dashboard.",
    },
    {
      q: "Do you offer corporate or volume discounts?",
      a: "Yes, corporate clients receive access to dedicated account managers and tiered pricing promo codes (e.g. EVENTIFY10 or VIP30).",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-hidden">
      {/* HERO SECTION */}
      <section className="relative pt-32 pb-24 md:pt-44 md:pb-36">
        {/* Animated Gradient Orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-primary/30 via-purple-600/20 to-pink-500/20 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute -top-20 -left-20 w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px]" />
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider mb-2 backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              <span>Next-Gen Event Planning Platform</span>
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-black tracking-tight leading-[1.1]">
              Craft Unforgettable <br />
              <span className="bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent">
                World-Class Experiences
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mx-auto leading-relaxed">
              From luxury galas and grand weddings to corporate summits. Discover, customize, and book premier events with complete ease.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/explore">
                <Button size="lg" className="w-full sm:w-auto rounded-full px-9 h-14 text-base font-semibold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 shadow-xl shadow-primary/25 hover:shadow-primary/40 gap-2 transition-all">
                  Explore Event Packages
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/explore">
                <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full px-8 h-14 text-base border-white/15 bg-white/5 hover:bg-white/10 backdrop-blur-md">
                  View Demo Catalog
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* STATISTICS COUNTER */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mt-20 p-6 rounded-3xl border border-white/10 bg-card/30 backdrop-blur-xl shadow-2xl"
          >
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold font-mono text-white">500+</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Events Hosted</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold font-mono text-primary">99.8%</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Satisfaction Rate</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold font-mono text-purple-400">50K+</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Happy Guests</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400">24/7</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Concierge Support</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* TRUSTED PARTNERS LOGO BANNER */}
      <section className="py-8 border-y border-white/10 bg-black/40">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-6">
            Trusted by top global organizers & brands
          </p>
          <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500 text-lg font-bold font-mono tracking-widest">
            <span>TECHCRUNCH</span>
            <span>FORBES</span>
            <span>VOGUE</span>
            <span>BLOOMBERG</span>
            <span>WIRED</span>
          </div>
        </div>
      </section>

      {/* POPULAR CATEGORIES */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl md:text-4xl font-display font-bold">Browse by Category</h2>
            <p className="text-muted-foreground">Tailored experiences curated for every occasion</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {categories.map((cat, idx) => (
              <Link key={cat.name} href={`/explore?category=${encodeURIComponent(cat.name.split(' ')[0])}`}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  className={`p-6 rounded-2xl border border-white/10 bg-gradient-to-b ${cat.color} backdrop-blur-md cursor-pointer hover:border-primary/50 transition-all group h-full flex flex-col justify-between`}
                >
                  <div className="w-12 h-12 rounded-xl bg-background/60 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg font-display text-white mb-1 group-hover:text-primary transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">{cat.count}</p>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED EVENTS */}
      <section className="py-20 bg-card/20 border-y border-white/5 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary mb-2">
                <Award className="w-4 h-4" />
                Featured Packages
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold">Trending Destinations</h2>
            </div>
            <Link href="/explore">
              <Button variant="ghost" className="group hover:bg-white/5 text-primary">
                View All Experiences
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-[380px] bg-white/5 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredEvents.slice(0, 3).map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl md:text-4xl font-display font-bold">Loved by Host & Guests</h2>
            <p className="text-muted-foreground">Read how Eventify transforms milestone moments into magic</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-3xl border border-white/10 bg-card/40 backdrop-blur-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex gap-1 text-amber-400 mb-4">
                    {[...Array(t.rating)].map((_, r) => (
                      <Star key={r} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-6 italic">"{t.content}"</p>
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-white/5">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/30" />
                  <div>
                    <h4 className="font-bold text-sm text-white">{t.name}</h4>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-20 bg-card/10 border-t border-white/5">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12 space-y-2">
            <h2 className="text-3xl font-display font-bold">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-sm">Everything you need to know about booking with us</p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border border-white/10 rounded-2xl px-6 bg-card/30 backdrop-blur-md">
                <AccordionTrigger className="text-base font-bold hover:no-underline py-4">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm pb-4 leading-relaxed">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="p-12 md:p-16 rounded-3xl bg-gradient-to-r from-primary via-purple-600 to-pink-600 text-center space-y-6 shadow-2xl shadow-primary/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-2xl" />
            <h2 className="text-4xl md:text-5xl font-display font-extrabold text-white">
              Ready to Host an Unforgettable Event?
            </h2>
            <p className="text-white/90 text-lg max-w-xl mx-auto font-light">
              Join thousands of planners and host seamless celebrations. Browse our catalog today.
            </p>
            <Link href="/explore">
              <Button size="lg" className="rounded-full px-10 h-14 bg-white text-black hover:bg-slate-100 font-bold shadow-xl">
                Get Started Now
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

