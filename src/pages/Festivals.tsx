import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarIcon, Clock, MapPin, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Festivals = () => {
  const { data: festivals } = useQuery({
    queryKey: ["festivals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("festival_events")
        .select("*")
        .gte("event_date", new Date().toISOString().split('T')[0])
        .order("event_date");
      if (error) throw error;
      return data;
    },
  });

  const { data: pastFestivals } = useQuery({
    queryKey: ["past-festivals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("festival_events")
        .select("*")
        .lt("event_date", new Date().toISOString().split('T')[0])
        .order("event_date", { ascending: false })
        .limit(6);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Festival Calendar</h1>
          <p className="text-muted-foreground">
            Upcoming and past temple celebrations and special events
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-6">Upcoming Festivals</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {festivals?.map((festival) => (
              <Card key={festival.id} className="overflow-hidden">
                {festival.image_url && (
                  <img
                    src={festival.image_url}
                    alt={festival.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl">{festival.title}</CardTitle>
                    {festival.is_major_festival && (
                      <Badge variant="default" className="gap-1">
                        <Star className="h-3 w-3" />
                        Major
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{festival.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(festival.event_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  {festival.start_time && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {festival.start_time}
                        {festival.end_time && ` - ${festival.end_time}`}
                      </span>
                    </div>
                  )}
                  {festival.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{festival.location}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {festivals?.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No upcoming festivals scheduled</p>
              </CardContent>
            </Card>
          )}
        </div>

        {pastFestivals && pastFestivals.length > 0 && (
          <div>
            <h2 className="text-2xl font-semibold mb-6">Past Celebrations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastFestivals.map((festival) => (
                <Card key={festival.id} className="opacity-75">
                  {festival.image_url && (
                    <img
                      src={festival.image_url}
                      alt={festival.title}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{festival.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {new Date(festival.event_date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Festivals;
