import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getUserTrips, deleteTrip } from "@/services/TravelDataService";
import { Trash2, Calendar, MapPin } from 'lucide-react';
import { toast } from "sonner";
import { format } from 'date-fns';
import { getCurrentUserId } from '@/services/FirebaseService';

interface Trip {
  id: string;
  tripName: string;
  destination: string;
  startDate: string;
  endDate: string;
  notes: string;
  createdAt: { toDate: () => Date };
}

interface SavedTripsProps {
  userId?: string;
  refreshTrigger?: number;
}

const SavedTrips = ({ userId, refreshTrigger = 0 }: SavedTripsProps) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchTrips = async () => {
      const currentUserId = userId || getCurrentUserId();
      if (!currentUserId) {
        setError("Please login to view your trips");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const tripsData = await getUserTrips(currentUserId);
        setTrips(tripsData as Trip[]);
      } catch (err) {
        console.error("Error fetching trips:", err);
        setError("Failed to load your trips. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchTrips();
  }, [refreshTrigger, userId]);
  
  const handleDeleteTrip = async (tripId: string) => {
    if (window.confirm("Are you sure you want to delete this trip?")) {
      try {
        await deleteTrip(tripId);
        setTrips(trips.filter(trip => trip.id !== tripId));
        toast.success("Trip deleted successfully");
      } catch (err) {
        console.error("Error deleting trip:", err);
        toast.error("Failed to delete trip");
      }
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch {
      return dateString;
    }
  };
  
  if (loading) {
    return <div className="text-center py-8">Loading your trips...</div>;
  }
  
  if (error) {
    return <div className="text-center text-red-500 py-8">{error}</div>;
  }
  
  if (trips.length === 0) {
    return (
      <Card className="shadow-soft">
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">You haven't saved any trips yet.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Your Saved Trips</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trips.map((trip) => (
            <div 
              key={trip.id} 
              className="border rounded-lg p-4 hover:bg-muted/20 transition-colors"
            >
              <div className="flex justify-between items-start">
                <h3 className="font-medium text-lg">{trip.tripName}</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDeleteTrip(trip.id)}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center text-muted-foreground text-sm mt-1">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                <span>{trip.destination}</span>
              </div>
              
              <div className="flex items-center text-muted-foreground text-sm mt-1">
                <Calendar className="h-3.5 w-3.5 mr-1" />
                <span>
                  {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                </span>
              </div>
              
              {trip.notes && (
                <p className="text-sm mt-2 border-t pt-2 text-muted-foreground">
                  {trip.notes}
                </p>
              )}
              
              <div className="text-xs text-muted-foreground/60 mt-2">
                Saved on {trip.createdAt?.toDate ? 
                  format(trip.createdAt.toDate(), 'MMM d, yyyy') : 
                  'Unknown date'}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default SavedTrips;
