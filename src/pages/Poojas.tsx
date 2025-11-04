import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Clock, IndianRupee } from "lucide-react";

const Poojas = () => {
  const { data: poojas, isLoading } = useQuery({
    queryKey: ["poojas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("poojas").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
          Pooja Services
        </h1>
        <p className="text-muted-foreground">Browse our sacred ritual services and offerings</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {poojas?.map((pooja) => (
            <Card key={pooja.id} className="p-6 hover:shadow-[var(--shadow-medium)] transition-all duration-300 border-border/50">
              <div className="mb-4">
                <h3 className="text-2xl font-bold mb-2">{pooja.name}</h3>
                <p className="text-sm text-muted-foreground">{pooja.description}</p>
              </div>

              <div className="flex items-center gap-4 mb-4">
                {pooja.duration_minutes && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {pooja.duration_minutes} mins
                  </Badge>
                )}
                {pooja.base_price && (
                  <Badge className="bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-primary/20 flex items-center gap-1">
                    <IndianRupee className="w-3 h-3" />
                    {Number(pooja.base_price).toLocaleString('en-IN')}
                  </Badge>
                )}
              </div>

              <div className="pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  Contact temple office for booking
                </p>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Poojas;
