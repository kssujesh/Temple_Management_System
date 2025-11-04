import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, Calendar as CalendarIcon } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const Bookings = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    devotee_id: "",
    pooja_id: "",
    scheduled_date: "",
    scheduled_time: "",
    special_requests: "",
    amount_paid: "",
  });

  const queryClient = useQueryClient();

  const { data: bookings, isLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pooja_bookings")
        .select(`
          *,
          devotees(name, contact_number),
          poojas(name, base_price)
        `)
        .order("scheduled_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: devotees } = useQuery({
    queryKey: ["devotees-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("devotees").select("id, name").order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: poojas } = useQuery({
    queryKey: ["poojas-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("poojas").select("id, name, base_price").order("name");
      if (error) throw error;
      return data;
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("pooja_bookings").insert([{
        ...data,
        amount_paid: data.amount_paid ? parseFloat(data.amount_paid) : null,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success("Booking created successfully!");
      setIsDialogOpen(false);
      setFormData({
        devotee_id: "",
        pooja_id: "",
        scheduled_date: "",
        scheduled_time: "",
        special_requests: "",
        amount_paid: "",
      });
    },
    onError: () => {
      toast.error("Failed to create booking");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      in_progress: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      completed: "bg-green-500/10 text-green-500 border-green-500/20",
      cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
    };
    return colors[status as keyof typeof colors] || "";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Pooja Bookings
          </h1>
          <p className="text-muted-foreground">Manage pooja service bookings and schedules</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-accent">
              <Plus className="w-4 h-4 mr-2" />
              New Booking
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Booking</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="devotee">Devotee *</Label>
                <Select value={formData.devotee_id} onValueChange={(value) => setFormData({ ...formData, devotee_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select devotee" />
                  </SelectTrigger>
                  <SelectContent>
                    {devotees?.map((devotee) => (
                      <SelectItem key={devotee.id} value={devotee.id}>
                        {devotee.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="pooja">Pooja Service *</Label>
                <Select 
                  value={formData.pooja_id} 
                  onValueChange={(value) => {
                    const selectedPooja = poojas?.find(p => p.id === value);
                    setFormData({ 
                      ...formData, 
                      pooja_id: value,
                      amount_paid: selectedPooja?.base_price?.toString() || ""
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select pooja" />
                  </SelectTrigger>
                  <SelectContent>
                    {poojas?.map((pooja) => (
                      <SelectItem key={pooja.id} value={pooja.id}>
                        {pooja.name} - ₹{Number(pooja.base_price).toLocaleString('en-IN')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  required
                  value={formData.scheduled_date}
                  onChange={(e) => setFormData({ ...formData, scheduled_date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="time">Time *</Label>
                <Input
                  id="time"
                  type="time"
                  required
                  value={formData.scheduled_time}
                  onChange={(e) => setFormData({ ...formData, scheduled_time: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="amount">Amount Paid</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={formData.amount_paid}
                  onChange={(e) => setFormData({ ...formData, amount_paid: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="requests">Special Requests</Label>
                <Textarea
                  id="requests"
                  value={formData.special_requests}
                  onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={addMutation.isPending}>
                {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Booking"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/50 shadow-[var(--shadow-medium)]">
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-primary/5 to-secondary/5">
                  <TableHead>Devotee</TableHead>
                  <TableHead>Pooja</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Special Requests</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings?.map((booking) => (
                  <TableRow key={booking.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div>
                        <div>{booking.devotees?.name}</div>
                        <div className="text-xs text-muted-foreground">{booking.devotees?.contact_number}</div>
                      </div>
                    </TableCell>
                    <TableCell>{booking.poojas?.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div>{format(new Date(booking.scheduled_date), "dd MMM yyyy")}</div>
                          <div className="text-xs text-muted-foreground">{booking.scheduled_time}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {booking.amount_paid ? `₹${Number(booking.amount_paid).toLocaleString('en-IN')}` : "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(booking.status)}>
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {booking.special_requests || "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {bookings?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      No bookings found. Create your first booking to get started!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
};

export default Bookings;
