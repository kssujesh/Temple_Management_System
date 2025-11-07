import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Video, Calendar, Clock, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const VirtualDarshan = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: slots } = useQuery({
    queryKey: ["virtual-darshan-slots", selectedDate],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("virtual_darshan_slots")
        .select("*")
        .eq("slot_date", selectedDate)
        .eq("is_available", true)
        .order("slot_time");
      if (error) throw error;
      return data;
    },
  });

  const { data: myBookings } = useQuery({
    queryKey: ["my-darshan-bookings", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("virtual_darshan_bookings")
        .select("*, virtual_darshan_slots(*)")
        .eq("user_id", user?.id)
        .gte("virtual_darshan_slots.slot_date", new Date().toISOString().split('T')[0])
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const bookSlot = useMutation({
    mutationFn: async (slotId: string) => {
      const { error } = await supabase.from("virtual_darshan_bookings").insert({
        user_id: user?.id,
        slot_id: slotId,
        status: "confirmed",
        payment_status: "pending",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["virtual-darshan-slots"] });
      queryClient.invalidateQueries({ queryKey: ["my-darshan-bookings"] });
      toast({
        title: "Success",
        description: "Virtual darshan booked successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to book slot",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Virtual Darshan</h1>
          <p className="text-muted-foreground">
            Join live streaming of temple rituals and prayers
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Select Date</CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-2 border rounded"
                />
              </CardContent>
            </Card>

            <h2 className="text-2xl font-semibold mb-4">Available Slots</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {slots?.map((slot) => {
                const availableSpots = slot.max_bookings - slot.current_bookings;
                const isAlmostFull = availableSpots <= 10;
                
                return (
                  <Card key={slot.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            {slot.slot_time}
                          </CardTitle>
                          <CardDescription>
                            {slot.duration_minutes} minutes
                          </CardDescription>
                        </div>
                        {slot.price > 0 && (
                          <Badge variant="secondary">₹{slot.price}</Badge>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4" />
                          <span className={isAlmostFull ? "text-orange-600" : ""}>
                            {availableSpots} spots left
                          </span>
                        </div>
                        <Button
                          onClick={() => bookSlot.mutate(slot.id)}
                          className="w-full"
                          disabled={availableSpots === 0}
                        >
                          <Video className="mr-2 h-4 w-4" />
                          {availableSpots === 0 ? "Fully Booked" : "Book Now"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {slots?.length === 0 && (
              <Card className="text-center py-12">
                <CardContent>
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No slots available for this date
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                {myBookings && myBookings.length > 0 ? (
                  <div className="space-y-4">
                    {myBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="border rounded-lg p-4 space-y-2"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {new Date(booking.virtual_darshan_slots.slot_date).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {booking.virtual_darshan_slots.slot_time}
                            </p>
                          </div>
                          <Badge
                            variant={
                              booking.status === "confirmed"
                                ? "default"
                                : booking.status === "completed"
                                ? "secondary"
                                : "destructive"
                            }
                          >
                            {booking.status}
                          </Badge>
                        </div>
                        {booking.virtual_darshan_slots.meeting_link && booking.status === "confirmed" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => window.open(booking.virtual_darshan_slots.meeting_link, "_blank")}
                          >
                            Join Darshan
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No upcoming bookings</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualDarshan;
