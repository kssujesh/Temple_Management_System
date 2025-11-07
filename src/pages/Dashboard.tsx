import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Heart, Video, Bell, TrendingUp, Book } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();

  const { data: userBookings } = useQuery({
    queryKey: ["user-bookings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pooja_bookings")
        .select("*, poojas(*)")
        .eq("user_id", user?.id)
        .order("scheduled_date", { ascending: true })
        .limit(5);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: subscriptions } = useQuery({
    queryKey: ["user-subscriptions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_poojas")
        .select("*, poojas(*)")
        .eq("user_id", user?.id)
        .eq("is_active", true);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const { data: upcomingFestivals } = useQuery({
    queryKey: ["upcoming-festivals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("festival_events")
        .select("*")
        .gte("event_date", new Date().toISOString().split('T')[0])
        .order("event_date", { ascending: true })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const { data: activeCampaigns } = useQuery({
    queryKey: ["active-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donation_campaigns")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Welcome to Your Dashboard</h1>
        <p className="text-muted-foreground mb-8">Manage your spiritual journey</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Link to="/poojas">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Calendar className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Book Pooja</CardTitle>
                <CardDescription>Schedule a ritual service</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/donations">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Heart className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Donate</CardTitle>
                <CardDescription>Support our causes</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/virtual-darshan">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Video className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Virtual Darshan</CardTitle>
                <CardDescription>Join online prayers</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/subscriptions">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Bell className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Subscriptions</CardTitle>
                <CardDescription>Manage recurring poojas</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/festivals">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <TrendingUp className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Festivals</CardTitle>
                <CardDescription>View upcoming events</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link to="/community">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <Book className="h-8 w-8 text-primary mb-2" />
                <CardTitle>Community</CardTitle>
                <CardDescription>Join discussions</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Bookings</CardTitle>
            </CardHeader>
            <CardContent>
              {userBookings && userBookings.length > 0 ? (
                <div className="space-y-4">
                  {userBookings.map((booking) => (
                    <div key={booking.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{booking.poojas?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(booking.scheduled_date).toLocaleDateString()} at {booking.scheduled_time}
                        </p>
                      </div>
                      <span className="text-sm font-medium">₹{booking.amount_paid}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No upcoming bookings</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Subscriptions</CardTitle>
            </CardHeader>
            <CardContent>
              {subscriptions && subscriptions.length > 0 ? (
                <div className="space-y-4">
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{sub.poojas?.name}</p>
                        <p className="text-sm text-muted-foreground capitalize">{sub.frequency}</p>
                      </div>
                      <span className="text-sm font-medium">₹{sub.amount}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No active subscriptions</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Festivals</CardTitle>
            </CardHeader>
            <CardContent>
              {upcomingFestivals && upcomingFestivals.length > 0 ? (
                <div className="space-y-4">
                  {upcomingFestivals.map((festival) => (
                    <div key={festival.id} className="border-b pb-2">
                      <p className="font-medium">{festival.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(festival.event_date).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No upcoming festivals</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Campaigns</CardTitle>
            </CardHeader>
            <CardContent>
              {activeCampaigns && activeCampaigns.length > 0 ? (
                <div className="space-y-4">
                  {activeCampaigns.map((campaign) => (
                    <div key={campaign.id} className="border-b pb-2">
                      <p className="font-medium">{campaign.title}</p>
                      <div className="mt-2">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${Math.min((Number(campaign.current_amount) / Number(campaign.target_amount)) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          ₹{campaign.current_amount} of ₹{campaign.target_amount}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No active campaigns</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
