import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-background mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
             <Link href="/" className="flex items-center gap-2 group mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center">
                <span className="text-white font-bold font-display text-xl">E</span>
              </div>
              <span className="font-display font-bold text-xl tracking-tight text-white">
                Eventify
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Crafting unforgettable moments with precision and style. Your vision, our expertise.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-white">Platform</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/explore" className="hover:text-primary transition-colors">Browse Events</Link></li>
              <li><Link href="/review" className="hover:text-primary transition-colors">My Selection</Link></li>
              <li><Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-6 text-white">Company</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6 text-white">Connect</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Twitter</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Eventify Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
