import { useDashboardStats } from "@/hooks/use-bookings";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Calendar, DollarSign, Package, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function Dashboard() {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { data: stats, isLoading: isStatsLoading } = useDashboardStats();

  if (isAuthLoading || isStatsLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = "/api/login";
    return null;
  }

  // Mock data for the chart since real data is sparse in MVP
  const chartData = [
    { name: 'Jan', value: 400 },
    { name: 'Feb', value: 300 },
    { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 },
    { name: 'May', value: 500 },
    { name: 'Jun', value: 900 },
    { name: 'Jul', value: stats?.totalSpent || 1000 },
  ];

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="container mx-auto px-4">
        <header className="mb-12">
          <h1 className="text-3xl font-display font-bold mb-2">Welcome back, {user?.firstName}</h1>
          <p className="text-muted-foreground">Here's what's happening with your events.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <StatsCard 
            title="Total Bookings" 
            value={stats?.totalBookings || 0} 
            icon={<Package className="w-5 h-5 text-blue-400" />}
            trend="+12% this month"
          />
          <StatsCard 
            title="Total Spent" 
            value={`$${Number(stats?.totalSpent || 0).toLocaleString()}`} 
            icon={<DollarSign className="w-5 h-5 text-green-400" />}
            trend="+5% this month"
          />
          <StatsCard 
            title="Active Events" 
            value={stats?.recentBookings?.length || 0} 
            icon={<Calendar className="w-5 h-5 text-purple-400" />}
            trend="Ongoing"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold mb-6">Recent Activity</h2>
            <div className="space-y-4">
              {stats?.recentBookings?.length === 0 ? (
                <div className="p-8 border border-white/5 bg-white/5 rounded-2xl text-center">
                  <p className="text-muted-foreground">No bookings found yet.</p>
                </div>
              ) : (
                stats?.recentBookings?.map((booking: any) => (
                  <div key={booking.id} className="p-4 rounded-xl bg-card border border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <CheckIcon status={booking.status} />
                      </div>
                      <div>
                        <p className="font-bold text-sm">Booking #{booking.bookingReference.substring(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(booking.createdAt), "MMM d, yyyy")}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono font-bold">${Number(booking.totalPrice).toLocaleString()}</span>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Chart */}
          <div className="lg:col-span-1">
             <h2 className="text-xl font-bold mb-6">Spending Overview</h2>
             <Card className="p-6 bg-card border-white/5 h-[300px]">
               <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData}>
                   <defs>
                     <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                       <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                     </linearGradient>
                   </defs>
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '8px' }}
                     itemStyle={{ color: '#fff' }}
                   />
                   <Area type="monotone" dataKey="value" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorValue)" />
                 </AreaChart>
               </ResponsiveContainer>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon, trend }: { title: string, value: string | number, icon: React.ReactNode, trend: string }) {
  return (
    <Card className="p-6 bg-card border-white/5 backdrop-blur-sm relative overflow-hidden group hover:border-white/10 transition-colors">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>
          <h3 className="text-3xl font-display font-bold">{value}</h3>
        </div>
        <div className="p-2 rounded-lg bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <p className="text-xs text-muted-foreground/60">{trend}</p>
    </Card>
  );
}

function CheckIcon({ status }: { status: string }) {
  if (status === 'confirmed') return <Package className="w-5 h-5" />;
  return <Loader2 className="w-5 h-5 animate-spin" />;
}
