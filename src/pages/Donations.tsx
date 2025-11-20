import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Heart, TrendingUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const Donations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const { data: campaigns } = useQuery({
    queryKey: ["donation-campaigns"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donation_campaigns")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createDonation = useMutation({
    mutationFn: async (donationData: any) => {
      const { error } = await supabase.from("donations").insert(donationData);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donation-campaigns"] });
      toast({
        title: "Success",
        description: "Thank you for your generous donation!",
      });
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to process donation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setAmount("");
    setDonorName("");
    setDonorEmail("");
    setDonorPhone("");
    setIsAnonymous(false);
    setSelectedCampaign(null);
  };

  const handleDonate = () => {
    // SECURITY: Require authentication for donations
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a donation",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (!isAnonymous && !donorName) {
      toast({
        title: "Error",
        description: "Please enter your name",
        variant: "destructive",
      });
      return;
    }

    createDonation.mutate({
      user_id: user.id, // Always set to authenticated user
      campaign_id: selectedCampaign,
      amount: parseFloat(amount),
      donor_name: isAnonymous ? "Anonymous" : donorName,
      donor_email: donorEmail || null,
      donor_phone: donorPhone || null,
      is_anonymous: isAnonymous,
      payment_status: "pending",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Donation Campaigns</h1>
          <p className="text-muted-foreground">
            Support our temple and contribute to noble causes
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns?.map((campaign) => {
            const progress = (Number(campaign.current_amount) / Number(campaign.target_amount)) * 100;
            return (
              <Card key={campaign.id} className="overflow-hidden">
                {campaign.image_url && (
                  <img
                    src={campaign.image_url}
                    alt={campaign.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <CardHeader>
                  <CardTitle>{campaign.title}</CardTitle>
                  <CardDescription>{campaign.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-muted-foreground">
                          ₹{campaign.current_amount.toLocaleString()}
                        </span>
                        <span className="font-medium">
                          ₹{campaign.target_amount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Ends on</span>
                      <span>{new Date(campaign.end_date).toLocaleDateString()}</span>
                    </div>
                    <Dialog open={open && selectedCampaign === campaign.id} onOpenChange={(isOpen) => {
                      setOpen(isOpen);
                      if (isOpen) setSelectedCampaign(campaign.id);
                      else resetForm();
                    }}>
                      <DialogTrigger asChild>
                        <Button className="w-full" onClick={() => setSelectedCampaign(campaign.id)}>
                          <Heart className="mr-2 h-4 w-4" />
                          Donate Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Make a Donation</DialogTitle>
                          <DialogDescription>
                            Supporting: {campaign.title}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="amount">Amount (₹)</Label>
                            <Input
                              id="amount"
                              type="number"
                              placeholder="1000"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="anonymous"
                              checked={isAnonymous}
                              onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                            />
                            <label
                              htmlFor="anonymous"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Donate anonymously
                            </label>
                          </div>
                          {!isAnonymous && (
                            <>
                              <div>
                                <Label htmlFor="donorName">Full Name *</Label>
                                <Input
                                  id="donorName"
                                  placeholder="Your name"
                                  value={donorName}
                                  onChange={(e) => setDonorName(e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor="donorEmail">Email</Label>
                                <Input
                                  id="donorEmail"
                                  type="email"
                                  placeholder="your@email.com"
                                  value={donorEmail}
                                  onChange={(e) => setDonorEmail(e.target.value)}
                                />
                              </div>
                              <div>
                                <Label htmlFor="donorPhone">Phone</Label>
                                <Input
                                  id="donorPhone"
                                  placeholder="1234567890"
                                  value={donorPhone}
                                  onChange={(e) => setDonorPhone(e.target.value)}
                                />
                              </div>
                            </>
                          )}
                          <Button onClick={handleDonate} className="w-full">
                            Complete Donation
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Donations;
