import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { ShoppingBag, LayoutDashboard, LogOut, User as UserIcon, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { items } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/explore", label: "Explore" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav h-16">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-purple-400 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform duration-300">
            <span className="text-white font-bold font-display text-xl">E</span>
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white group-hover:text-primary transition-colors">
            Eventify
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/review">
            <Button variant="ghost" size="icon" className="relative hover:bg-white/5">
              <ShoppingBag className="w-5 h-5 text-foreground" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-primary text-white text-[10px] font-bold rounded-full animate-in zoom-in duration-300">
                  {items.length}
                </span>
              )}
            </Button>
          </Link>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-white/10 p-0 overflow-hidden">
                  {user?.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt={user.firstName || "User"} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-secondary flex items-center justify-center">
                      <span className="font-bold text-xs">{user?.firstName?.[0] || "U"}</span>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/dashboard">
                  <DropdownMenuItem className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="text-destructive cursor-pointer focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => window.location.href = "/api/login"} size="sm" className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm">
              Log In
            </Button>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="w-6 h-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-card border-l border-white/10 w-[300px]">
            <div className="flex flex-col gap-6 mt-8">
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      "text-lg font-medium px-4 py-2 rounded-lg transition-colors",
                      location === link.href ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
              
              <div className="h-px bg-white/10" />

              <div className="flex flex-col gap-4">
                <Link href="/review" onClick={() => setIsOpen(false)}>
                  <div className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                    <span className="text-foreground font-medium">Your Selection</span>
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-bold">{items.length}</span>
                      <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </Link>
                
                {isAuthenticated ? (
                   <>
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      <div className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-white/5 text-foreground">
                        <LayoutDashboard className="w-5 h-5" />
                        Dashboard
                      </div>
                    </Link>
                    <Button onClick={() => logout()} variant="destructive" className="w-full mt-4">
                      Log Out
                    </Button>
                   </>
                ) : (
                  <Button onClick={() => window.location.href = "/api/login"} className="w-full">
                    Log In
                  </Button>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
