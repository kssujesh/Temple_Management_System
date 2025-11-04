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
import { Plus, Loader2, IndianRupee, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

const Transactions = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    devotee_id: "",
    transaction_type: "donation" as "donation" | "pooja_fee" | "prasadam" | "other",
    amount: "",
    payment_method: "",
    reference_number: "",
    description: "",
  });

  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select(`
          *,
          devotees(name, contact_number)
        `)
        .order("transaction_date", { ascending: false });
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

  const totalRevenue = transactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  const addMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("transactions").insert([{
        ...data,
        amount: parseFloat(data.amount),
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction recorded successfully!");
      setIsDialogOpen(false);
      setFormData({
        devotee_id: "",
        transaction_type: "donation",
        amount: "",
        payment_method: "",
        reference_number: "",
        description: "",
      });
    },
    onError: () => {
      toast.error("Failed to record transaction");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addMutation.mutate(formData);
  };

  const getTypeColor = (type: string) => {
    const colors = {
      donation: "bg-green-500/10 text-green-500 border-green-500/20",
      pooja_fee: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      prasadam: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      other: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    };
    return colors[type as keyof typeof colors] || "";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Transactions
          </h1>
          <p className="text-muted-foreground">Track donations, payments, and temple revenue</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-accent">
              <Plus className="w-4 h-4 mr-2" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Record New Transaction</DialogTitle>
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
                <Label htmlFor="type">Transaction Type *</Label>
                <Select 
                  value={formData.transaction_type} 
                  onValueChange={(value: any) => setFormData({ ...formData, transaction_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="donation">Donation</SelectItem>
                    <SelectItem value="pooja_fee">Pooja Fee</SelectItem>
                    <SelectItem value="prasadam">Prasadam</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="payment_method">Payment Method</Label>
                <Input
                  id="payment_method"
                  placeholder="e.g., Cash, UPI, Card"
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="reference">Reference Number</Label>
                <Input
                  id="reference"
                  value={formData.reference_number}
                  onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={addMutation.isPending}>
                {addMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Record Transaction"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6 mb-6 border-border/50 shadow-[var(--shadow-medium)]">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[var(--shadow-glow)]">
            <TrendingUp className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
            <p className="text-4xl font-bold flex items-center gap-1">
              <IndianRupee className="w-8 h-8" />
              {totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </Card>

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
                  <TableHead>Date</TableHead>
                  <TableHead>Devotee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions?.map((transaction) => (
                  <TableRow key={transaction.id} className="hover:bg-muted/50">
                    <TableCell>
                      {format(new Date(transaction.transaction_date), "dd MMM yyyy, HH:mm")}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div>
                        <div>{transaction.devotees?.name}</div>
                        <div className="text-xs text-muted-foreground">{transaction.devotees?.contact_number}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getTypeColor(transaction.transaction_type)}>
                        {transaction.transaction_type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₹{Number(transaction.amount).toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell>{transaction.payment_method || "-"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {transaction.reference_number || "-"}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {transaction.description || "-"}
                    </TableCell>
                  </TableRow>
                ))}
                {transactions?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      No transactions found. Record your first transaction to get started!
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

export default Transactions;
