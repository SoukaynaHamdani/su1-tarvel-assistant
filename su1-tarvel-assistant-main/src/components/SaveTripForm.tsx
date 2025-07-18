
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { createTrip } from "@/services/TravelDataService";
import { getCurrentUserId } from '@/services/FirebaseService';

interface SaveTripFormProps {
  userId?: string;
  onSaved?: () => void;
}

const SaveTripForm = ({ userId, onSaved }: SaveTripFormProps) => {
  const [tripName, setTripName] = useState('');
  const [destination, setDestination] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentUserId = userId || getCurrentUserId();
    if (!currentUserId) {
      toast.error("Please login to save trips");
      return;
    }
    
    if (!tripName || !destination || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSaving(true);
    
    try {
      await createTrip(currentUserId, {
        tripName,
        destination,
        startDate,
        endDate,
        notes,
      });
      
      // Reset form
      setTripName('');
      setDestination('');
      setStartDate('');
      setEndDate('');
      setNotes('');
      
      toast.success("Trip saved successfully!");
      
      if (onSaved) {
        onSaved();
      }
    } catch (error) {
      console.error("Error saving trip:", error);
      toast.error("Failed to save trip. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <Card className="shadow-soft">
      <CardHeader>
        <CardTitle>Save Your Trip</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Trip Name*</label>
            <Input 
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              placeholder="Summer vacation 2025"
              required
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Destination*</label>
            <Input 
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="Tokyo, Japan"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Start Date*</label>
              <Input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-1 block">End Date*</label>
              <Input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-1 block">Notes</label>
            <Textarea 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Special plans, budget information, etc."
              rows={3}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Trip"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SaveTripForm;
