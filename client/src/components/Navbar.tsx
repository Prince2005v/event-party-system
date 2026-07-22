import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { ShoppingBag, LayoutDashboard, LogOut, Menu, UserCheck, Sparkles, KeyRound, Mail, User as UserIcon } from "lucide-react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Navbar() {
  const [location] = useLocation();
  const { user, isAuthenticated, login, isLoggingIn, signup, isSigningUp, logout } = useAuth();
  const { items } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  // Form State
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [signupForm, setSignupForm] = useState({ username: "", email: "", password: "", firstName: "", lastName: "" });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginForm);
      setAuthDialogOpen(false);
    } catch (e) {}
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(signupForm);
      setAuthDialogOpen(false);
    } catch (e) {}
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/explore", label: "Explore" },
    { href: "/dashboard", label: "Dashboard" },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-white/10 bg-background/80 backdrop-blur-md h-16">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-primary via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-primary/25 group-hover:scale-105 transition-all duration-300">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <span className="font-display font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent group-hover:from-primary group-hover:to-purple-400 transition-all">
            Eventify
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-all hover:text-primary relative py-1",
                location === link.href ? "text-primary font-semibold" : "text-muted-foreground"
              )}
            >
              {link.label}
              {location === link.href && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full animate-in fade-in zoom-in duration-200" />
              )}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link href="/review">
            <Button variant="outline" size="sm" className="relative border-white/15 bg-white/5 hover:bg-white/10 gap-2">
              <ShoppingBag className="w-4 h-4 text-primary" />
              <span>Cart</span>
              {items.length > 0 && (
                <span className="w-5 h-5 flex items-center justify-center bg-primary text-primary-foreground text-xs font-bold rounded-full">
                  {items.length}
                </span>
              )}
            </Button>
          </Link>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full ring-2 ring-primary/30 p-0 overflow-hidden hover:ring-primary">
                  {user?.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt={user.username || "User"} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-primary/20 flex items-center justify-center">
                      <span className="font-bold text-xs text-primary">{user?.username?.[0]?.toUpperCase() || "U"}</span>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-card border-white/10 shadow-2xl" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email || `@${user?.username}`}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <Link href="/dashboard">
                  <DropdownMenuItem className="cursor-pointer gap-2">
                    <LayoutDashboard className="h-4 w-4 text-primary" />
                    Dashboard Analytics
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem onClick={() => logout()} className="text-destructive cursor-pointer gap-2 focus:text-destructive">
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 text-white shadow-lg shadow-primary/20">
                  Sign In
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-xl border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-center font-display text-2xl font-bold">Welcome to Eventify</DialogTitle>
                </DialogHeader>
                <Tabs defaultValue="login" className="w-full mt-4">
                  <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                    <TabsTrigger value="login">Log In</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>

                  {/* LOGIN TAB */}
                  <TabsContent value="login" className="space-y-4 pt-4">
                    <form onSubmit={handleLoginSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-username">Username</Label>
                        <Input
                          id="login-username"
                          placeholder="e.g. alex2026"
                          value={loginForm.username}
                          onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                          required
                          className="bg-background/50 border-white/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          required
                          className="bg-background/50 border-white/10"
                        />
                      </div>
                      <Button type="submit" disabled={isLoggingIn} className="w-full bg-primary hover:bg-primary/90 mt-2">
                        {isLoggingIn ? "Logging in..." : "Log In"}
                      </Button>
                    </form>
                  </TabsContent>

                  {/* SIGNUP TAB */}
                  <TabsContent value="signup" className="space-y-4 pt-4">
                    <form onSubmit={handleSignupSubmit} className="space-y-3">
                      <div className="space-y-1">
                        <Label htmlFor="signup-username">Username</Label>
                        <Input
                          id="signup-username"
                          placeholder="johndoe"
                          value={signupForm.username}
                          onChange={(e) => setSignupForm({ ...signupForm, username: e.target.value })}
                          required
                          className="bg-background/50 border-white/10"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="signup-email">Email</Label>
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="john@example.com"
                          value={signupForm.email}
                          onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                          required
                          className="bg-background/50 border-white/10"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="signup-first">First Name</Label>
                          <Input
                            id="signup-first"
                            placeholder="John"
                            value={signupForm.firstName}
                            onChange={(e) => setSignupForm({ ...signupForm, firstName: e.target.value })}
                            className="bg-background/50 border-white/10"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label htmlFor="signup-last">Last Name</Label>
                          <Input
                            id="signup-last"
                            placeholder="Doe"
                            value={signupForm.lastName}
                            onChange={(e) => setSignupForm({ ...signupForm, lastName: e.target.value })}
                            className="bg-background/50 border-white/10"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="signup-password">Password</Label>
                        <Input
                          id="signup-password"
                          type="password"
                          placeholder="••••••••"
                          value={signupForm.password}
                          onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                          required
                          className="bg-background/50 border-white/10"
                        />
                      </div>
                      <Button type="submit" disabled={isSigningUp} className="w-full bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700 mt-2">
                        {isSigningUp ? "Creating Account..." : "Create Account"}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Mobile Menu */}
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
                    <span className="text-foreground font-medium">Your Cart</span>
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-bold">{items.length}</span>
                      <ShoppingBag className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </div>
                </Link>

                {isAuthenticated ? (
                  <Button onClick={() => logout()} variant="destructive" className="w-full mt-4">
                    Log Out
                  </Button>
                ) : (
                  <Button onClick={() => setAuthDialogOpen(true)} className="w-full">
                    Sign In
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
