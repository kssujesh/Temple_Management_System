import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Bell, Plus, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

const Subscriptions = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedPooja, setSelectedPooja] = useState("");
  const [frequency, setFrequency] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [amount, setAmount] = useState("");
  const [specialRequests, setSpecialRequests] = useState("");

  const { data: poojas } = useQuery({
    queryKey: ["poojas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("poojas")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: subscriptions } = useQuery({
    queryKey: ["subscriptions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_poojas")
        .select("*, poojas(*)")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const createSubscription = useMutation({
    mutationFn: async (subscriptionData: any) => {
      const { error } = await supabase.from("subscription_poojas").insert(subscriptionData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast({
        title: "Success",
        description: "Subscription created successfully!",
      });
      setOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create subscription",
        variant: "destructive",
      });
    },
  });

  const cancelSubscription = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("subscription_poojas")
        .update({ is_active: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subscriptions"] });
      toast({
        title: "Success",
        description: "Subscription cancelled",
      });
    },
  });

  const resetForm = () => {
    setSelectedPooja("");
    setFrequency("");
    setStartDate("");
    setEndDate("");
    setAmount("");
    setSpecialRequests("");
  };

  const handleSubmit = () => {
    if (!selectedPooja || !frequency || !startDate || !amount) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    createSubscription.mutate({
      user_id: user?.id,
      pooja_id: selectedPooja,
      frequency,
      start_date: startDate,
      end_date: endDate || null,
      next_occurrence: startDate,
      amount: parseFloat(amount),
      special_requests: specialRequests || null,
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">Subscription Poojas</h1>
            <p className="text-muted-foreground">
              Set up recurring pooja bookings for regular blessings
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Subscription
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Subscription</DialogTitle>
                <DialogDescription>
                  Set up a recurring pooja booking
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pooja">Select Pooja *</Label>
                  <Select value={selectedPooja} onValueChange={setSelectedPooja}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a pooja" />
                    </SelectTrigger>
                    <SelectContent>
                      {poojas?.map((pooja) => (
                        <SelectItem key={pooja.id} value={pooja.id}>
                          {pooja.name} - ₹{pooja.base_price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger>
                      <SelectValue placeholder="How often?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date (Optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount per occurrence (₹) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="requests">Special Requests</Label>
                  <Textarea
                    id="requests"
                    placeholder="Any specific requirements..."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                  />
                </div>
                <Button onClick={handleSubmit} className="w-full">
                  Create Subscription
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subscriptions?.map((subscription) => (
            <Card key={subscription.id} className={!subscription.is_active ? "opacity-60" : ""}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{subscription.poojas?.name}</CardTitle>
                    <CardDescription className="capitalize">
                      {subscription.frequency} - ₹{subscription.amount}
                    </CardDescription>
                  </div>
                  {subscription.is_active && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => cancelSubscription.mutate(subscription.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Started</span>
                    <span>{new Date(subscription.start_date).toLocaleDateString()}</span>
                  </div>
                  {subscription.end_date && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ends</span>
                      <span>{new Date(subscription.end_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Next</span>
                    <span>{new Date(subscription.next_occurrence).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <span className={subscription.is_active ? "text-green-600" : "text-red-600"}>
                      {subscription.is_active ? "Active" : "Cancelled"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {subscriptions?.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No subscriptions yet. Create your first one!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;
