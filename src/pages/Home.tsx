import { Link } from "react-router-dom";
import { Users, Calendar, DollarSign, BookOpen, TrendingUp, Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import templeHero from "@/assets/temple-hero.jpg";

const Home = () => {
  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const [devotees, bookings, transactions] = await Promise.all([
        supabase.from("devotees").select("id", { count: "exact", head: true }),
        supabase.from("pooja_bookings").select("id", { count: "exact", head: true }),
        supabase.from("transactions").select("amount"),
      ]);

      const totalRevenue = transactions.data?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      return {
        totalDevotees: devotees.count || 0,
        totalBookings: bookings.count || 0,
        totalRevenue: totalRevenue,
      };
    },
  });

  const statCards = [
    {
      title: "Total Devotees",
      value: stats?.totalDevotees || 0,
      icon: Users,
      color: "from-primary to-primary/80",
      link: "/devotees",
    },
    {
      title: "Pooja Bookings",
      value: stats?.totalBookings || 0,
      icon: Calendar,
      color: "from-accent to-accent/80",
      link: "/bookings",
    },
    {
      title: "Total Revenue",
      value: `₹${stats?.totalRevenue.toLocaleString('en-IN') || 0}`,
      icon: DollarSign,
      color: "from-secondary to-secondary/80",
      link: "/transactions",
    },
  ];

  const quickActions = [
    { title: "Add Devotee", icon: Users, link: "/devotees", description: "Register new devotee" },
    { title: "Book Pooja", icon: BookOpen, link: "/bookings", description: "Schedule pooja service" },
    { title: "View Transactions", icon: TrendingUp, link: "/transactions", description: "Track donations & payments" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${templeHero})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
        </div>
        
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl">
            <div className="inline-block mb-4 px-6 py-2 rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/30 backdrop-blur-sm">
              <span className="text-sm font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Divine Management System
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent leading-tight">
              Temple Management System
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Streamline devotee services, pooja bookings, and temple operations with grace and efficiency
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:shadow-[var(--shadow-glow)] transition-all">
                <Link to="/devotees" className="flex items-center gap-2">
                  Get Started
                  <Heart className="w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary/30 hover:bg-primary/5">
                <Link to="/poojas">Browse Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        {/* Stats Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Dashboard Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Link key={stat.title} to={stat.link}>
                  <Card className="p-6 hover:shadow-[var(--shadow-medium)] transition-all duration-300 cursor-pointer group border-border/50">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-[var(--shadow-soft)] group-hover:shadow-[var(--shadow-glow)] transition-all`}>
                        <Icon className="w-6 h-6 text-primary-foreground" />
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.title} to={action.link}>
                  <Card className="p-6 hover:shadow-[var(--shadow-medium)] transition-all duration-300 cursor-pointer group border-border/50 h-full">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center mb-4 group-hover:shadow-[var(--shadow-glow)] transition-all">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{action.title}</h3>
                      <p className="text-sm text-muted-foreground">{action.description}</p>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
