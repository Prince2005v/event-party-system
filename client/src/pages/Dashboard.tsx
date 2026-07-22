import { useDashboardStats, useCancelBooking } from "@/hooks/use-bookings";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Calendar as CalendarIcon, DollarSign, Package, CheckCircle, Clock, XCircle, Award, TrendingUp, Sparkles, MapPin, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from "recharts";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const COLORS = ["#8b5cf6", "#ec4899", "#3b82f6", "#f59e0b", "#10b981"];

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { data: stats, isLoading: isStatsLoading } = useDashboardStats();
  const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking();

  if (isAuthLoading || isStatsLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const monthlyData = stats?.monthlySpending || [
    { month: "Jan", amount: 1200, bookings: 1 },
    { month: "Feb", amount: 2400, bookings: 2 },
    { month: "Mar", amount: 1800, bookings: 2 },
    { month: "Apr", amount: 3100, bookings: 3 },
    { month: "May", amount: 2700, bookings: 2 },
    { month: "Jun", amount: stats?.totalSpent || 4500, bookings: stats?.totalBookings || 4 },
  ];

  const categoryData = stats?.categoryDistribution || [
    { name: "Party", value: 4 },
    { name: "Wedding", value: 2 },
    { name: "Corporate", value: 3 },
    { name: "Birthday", value: 1 },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20 bg-background text-foreground">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 p-6 rounded-3xl bg-gradient-to-r from-card via-card/80 to-primary/10 border border-white/10 shadow-xl">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              SaaS Organizer Portal
            </div>
            <h1 className="text-3xl md:text-4xl font-display font-extrabold tracking-tight">
              Welcome back, {user?.firstName || user?.username || "Planner"}!
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Overview of your event reservations, spending metrics, and category analytics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-background/60 border border-white/10 text-right">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Status Level</span>
              <span className="text-sm font-bold text-amber-400 flex items-center gap-1">
                <Award className="w-4 h-4" /> VIP Host
              </span>
            </div>
          </div>
        </div>

        {/* 6 Key Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatsCard title="Total Bookings" value={stats?.totalBookings || 0} icon={<Package className="w-4 h-4 text-blue-400" />} color="border-blue-500/20" />
          <StatsCard title="Upcoming" value={stats?.upcomingEvents || 0} icon={<Clock className="w-4 h-4 text-amber-400" />} color="border-amber-500/20" />
          <StatsCard title="Completed" value={stats?.completedEvents || 0} icon={<CheckCircle className="w-4 h-4 text-emerald-400" />} color="border-emerald-500/20" />
          <StatsCard title="Cancelled" value={stats?.cancelledEvents || 0} icon={<XCircle className="w-4 h-4 text-red-400" />} color="border-red-500/20" />
          <StatsCard title="Total Spent" value={`$${Number(stats?.totalSpent || 0).toLocaleString()}`} icon={<DollarSign className="w-4 h-4 text-purple-400" />} color="border-purple-500/20" />
          <StatsCard title="Top Category" value={stats?.favoriteCategory || "Party"} icon={<Award className="w-4 h-4 text-pink-400" />} color="border-pink-500/20" />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          {/* Spending Area Chart */}
          <Card className="lg:col-span-8 p-6 bg-card border-white/10 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold font-display text-lg">Spending Trends ($)</h3>
                <p className="text-xs text-muted-foreground">Monthly expenditure on event venues and packages</p>
              </div>
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">6 Months</Badge>
            </div>
            <div className="h-[280px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <defs>
                    <linearGradient id="spendingGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="#71717a" fontSize={12} tickLine={false} />
                  <YAxis stroke="#71717a" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", borderColor: "#3f3f46", borderRadius: "12px" }}
                    itemStyle={{ color: "#fff" }}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#spendingGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Category Distribution Pie Chart */}
          <Card className="lg:col-span-4 p-6 bg-card border-white/10 rounded-3xl shadow-xl space-y-4">
            <div>
              <h3 className="font-bold font-display text-lg">Category Breakdown</h3>
              <p className="text-xs text-muted-foreground">Ratio of events booked by genre</p>
            </div>
            <div className="h-[240px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#18181b", borderColor: "#3f3f46", borderRadius: "12px" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs pt-2">
              {categoryData.map((c, i) => (
                <div key={c.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-muted-foreground">{c.name} ({c.value})</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Recent Bookings Activity List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display">Recent Activity & Reservations</h2>
            <Badge className="bg-primary/20 text-primary border-0">Live Updates</Badge>
          </div>

          <div className="space-y-3">
            {stats?.recentBookings?.length === 0 ? (
              <div className="p-12 border border-dashed border-white/10 rounded-3xl bg-card/20 text-center">
                <p className="text-muted-foreground text-sm mb-4">No active or past bookings recorded yet.</p>
                <Button size="sm" onClick={() => window.location.href = "/explore"}>
                  Explore Experiences
                </Button>
              </div>
            ) : (
              stats?.recentBookings?.map((booking: any) => (
                <div
                  key={booking.id}
                  className="p-5 rounded-2xl bg-card border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-white/20 transition-all shadow-md"
                >
                  <div className="flex items-start md:items-center gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-white font-mono">{booking.bookingReference}</span>
                        <StatusBadge status={booking.status} />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Booked on {format(new Date(booking.createdAt), "PPP")} • {booking.items?.length || 1} Event Package(s)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6">
                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Total Amount</span>
                      <span className="text-lg font-bold text-white font-mono">${Number(booking.totalPrice).toLocaleString()}</span>
                    </div>

                    {booking.status !== "cancelled" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => cancelBooking(booking.id)}
                        disabled={isCancelling}
                        className="text-xs text-destructive hover:bg-destructive/10 rounded-xl"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-1" />
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode; color: string }) {
  return (
    <Card className={`p-4 bg-card border ${color} rounded-2xl shadow-lg flex flex-col justify-between space-y-2`}>
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{title}</span>
        <div className="p-1.5 rounded-lg bg-background/60">{icon}</div>
      </div>
      <p className="text-2xl font-extrabold font-mono text-white tracking-tight">{value}</p>
    </Card>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "confirmed":
      return <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-[10px] uppercase">Confirmed</Badge>;
    case "completed":
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[10px] uppercase">Completed</Badge>;
    case "cancelled":
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] uppercase">Cancelled</Badge>;
    default:
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-[10px] uppercase">Pending</Badge>;
  }
}
