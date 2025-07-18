
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import BottomNavigation from '@/components/BottomNavigation';
import { generateCulturalTranslation } from '@/services/GeminiService';
import { getCurrentUserId } from '@/services/FirebaseService';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/services/FirebaseService';
import { toast } from "sonner";

const CulturalTranslator = () => {
  const [originCountry, setOriginCountry] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const currentUserId = getCurrentUserId();
    setUserId(currentUserId);
  }, []);

  // Sample list of countries for the dropdowns
  const countries = [
    'Australia', 'Brazil', 'Canada', 'China', 'Egypt', 'France', 
    'Germany', 'India', 'Italy', 'Japan', 'Mexico', 'Morocco', 
    'Netherlands', 'Russia', 'South Korea', 'Spain', 'Thailand', 
    'United Kingdom', 'United States', 'Vietnam'
  ];

  const saveTranslationToDatabase = async (translationData) => {
    try {
      if (!userId) {
        console.log("No user ID available, not saving translation");
        return;
      }

      await addDoc(collection(db, 'translations'), {
        userId,
        originCountry,
        destinationCountry,
        question,
        response: translationData,
        timestamp: new Date()
      });
      
      console.log('Translation saved to database');
    } catch (error) {
      console.error('Error saving translation to database:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!originCountry || !destinationCountry || !question.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    setResponse('');
    
    try {
      const result = await generateCulturalTranslation(
        originCountry,
        destinationCountry,
        question
      );
      
      setResponse(result);
      
      // Save the translation to the database
      await saveTranslationToDatabase(result);
      
    } catch (error) {
      console.error('Error generating cultural translation:', error);
      setResponse('Sorry, I had trouble processing your request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="pb-20 animate-fade-in">
      <div className="bg-primary text-primary-foreground p-6">
        <h1 className="text-xl font-semibold">Cultural Translator</h1>
        <p className="text-sm opacity-90">Learn about local customs and etiquette</p>
      </div>
      
      <div className="p-4">
        <Card className="mb-4 shadow-soft">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Country</label>
                  <Select value={originCountry} onValueChange={setOriginCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Destination</label>
                  <Select value={destinationCountry} onValueChange={setDestinationCountry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">What would you like to know?</label>
                <Textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., What gestures should I avoid? What's the appropriate dress code? How do I tip?"
                  rows={3}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Translating...' : 'Get Cultural Insights'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {response && (
          <Card className="shadow-soft animate-slide-up">
            <CardContent className="pt-6">
              <h2 className="font-medium mb-3">Cultural Insights</h2>
              <div className="text-sm whitespace-pre-line">{response}</div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
};

export default CulturalTranslator;
