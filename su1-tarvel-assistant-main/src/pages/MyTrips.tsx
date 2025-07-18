
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNavigation from '@/components/BottomNavigation';
import SaveTripForm from '@/components/SaveTripForm';
import SavedTrips from '@/components/SavedTrips';
import { getCurrentUserId } from '@/services/FirebaseService';

const MyTrips = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  useEffect(() => {
    // Get the authenticated user's ID
    const currentUserId = getCurrentUserId();
    setUserId(currentUserId || null);
  }, []);
  
  // Function to trigger a refresh of the trips list
  const handleTripSaved = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <div className="pb-20 animate-fade-in">
      <div className="bg-primary text-primary-foreground p-6">
        <h1 className="text-xl font-semibold">My Trips</h1>
        <p className="text-sm opacity-90">Plan and manage your travel itineraries</p>
      </div>
      
      <div className="p-4">
        <Tabs defaultValue="saved" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="saved">Saved Trips</TabsTrigger>
            <TabsTrigger value="new">Add New Trip</TabsTrigger>
          </TabsList>
          
          <TabsContent value="saved">
            <SavedTrips refreshTrigger={refreshTrigger} />
          </TabsContent>
          
          <TabsContent value="new">
            <SaveTripForm onSaved={handleTripSaved} />
          </TabsContent>
        </Tabs>
        
        <Card className="mt-6 bg-muted/30">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">💡 Tip: Trip Planning</p>
              <p>Save your trip details to access them offline during your travels. You can add multiple destinations to build a complete itinerary.</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default MyTrips;
