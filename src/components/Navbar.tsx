import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, Users, Calendar, DollarSign, BookOpen, Heart, Video, CalendarDays, MessageSquare, LayoutDashboard, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navItems = user ? [
    { path: "/", label: "Home", icon: Home },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/donations", label: "Donations", icon: Heart },
    { path: "/virtual-darshan", label: "Virtual Darshan", icon: Video },
    { path: "/festivals", label: "Festivals", icon: CalendarDays },
    { path: "/community", label: "Community", icon: MessageSquare },
    { path: "/devotees", label: "Devotees", icon: Users },
    { path: "/poojas", label: "Poojas", icon: BookOpen },
    { path: "/bookings", label: "Bookings", icon: Calendar },
    { path: "/transactions", label: "Transactions", icon: DollarSign },
  ] : [];

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (!user) return null;

  return (
    <nav className="bg-card border-b border-border/50 shadow-[var(--shadow-soft)] sticky top-0 z-50 backdrop-blur-sm bg-card/95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[var(--shadow-glow)]">
              <span className="text-primary-foreground font-bold text-xl">ॐ</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Temple Management
            </span>
          </Link>

          <div className="hidden lg:flex items-center gap-1">
            {navItems.slice(0, 6).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 text-sm",
                    isActive
                      ? "bg-gradient-to-r from-primary/10 to-accent/10 text-primary font-medium shadow-[var(--shadow-soft)]"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>

          <div className="lg:hidden flex items-center gap-2">
            {navItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "p-2 rounded-lg transition-all",
                    isActive
                      ? "bg-gradient-to-r from-primary/10 to-accent/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  <Icon className="w-5 h-5" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
