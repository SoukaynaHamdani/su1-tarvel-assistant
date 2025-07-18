
import React from 'react';
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNavigation from '@/components/BottomNavigation';
import { MapPin, Calendar, Palette } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const Dashboard = () => {
  const navigate = useNavigate();

  const destinations = [
    { id: 1, name: 'Marrakech, Morocco', image: 'https://images.unsplash.com/photo-1466442929976-97f336a657be', description: 'Experience the Koutoubia Mosque and vibrant souks'},
    { id: 2, name: 'Kyoto, Japan', image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=500', description: 'Ancient temples and beautiful gardens'},
    { id: 3, name: 'Santorini, Greece', image: 'https://images.unsplash.com/photo-1504512485720-7d83a16ee930?q=80&w=500', description: 'Stunning views and white-washed buildings'}
  ];

  const culturalSpots = [
    { id: 1, name: 'Louvre Museum', location: 'Paris, France', image: 'https://images.unsplash.com/photo-1496307653780-42ee777d4833'},
    { id: 2, name: 'Taj Mahal', location: 'Agra, India', image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?q=80&w=500'},
    { id: 3, name: 'Acropolis', location: 'Athens, Greece', image: 'https://images.unsplash.com/photo-1603565816030-6b389eeb23cb?q=80&w=500'}
  ];

  const events = [
    { id: 1, name: 'Carnival of Venice', date: 'Feb 4 - Feb 21', location: 'Venice, Italy' },
    { id: 2, name: 'Cherry Blossom Festival', date: 'Mar 20 - Apr 10', location: 'Tokyo, Japan' },
    { id: 3, name: 'Lantern Festival', date: 'Feb 24', location: 'Chiang Mai, Thailand' }
  ];

  const renderTip = () => {
    const tips = [
      "Always carry a reusable water bottle to stay hydrated during your travels.",
      "Learn a few basic phrases in the local language to connect with locals.",
      "Take photos of your important documents and store them in the cloud.",
      "Pack a portable charger for your devices.",
      "Register with your embassy when traveling to remote locations."
    ];
    
    return tips[Math.floor(Math.random() * tips.length)];
  };

  const handleDestinationClick = (destinationName: string) => {
    navigate(`/map?destination=${encodeURIComponent(destinationName)}`);
  };

  const handleCultureClick = (spotName: string) => {
    navigate(`/chat?place=${encodeURIComponent(spotName)}`);
  };

  return (
    <div className="pb-20 animate-fade-in">
      <div className="bg-primary text-primary-foreground p-6 rounded-b-3xl shadow-soft">
        <h1 className="text-2xl font-semibold mb-1">Discover New Places</h1>
        <p className="text-sm opacity-90">Where will your next adventure take you?</p>
      </div>

      <div className="px-4 py-4">
        <Card className="shadow-soft">
          <CardContent className="py-4">
            <div className="flex items-start">
              <div className="bg-primary/10 rounded-full p-2 mr-4">
                <span className="text-xl">💡</span>
              </div>
              <div>
                <p className="text-sm font-medium">Daily Travel Tip</p>
                <p className="text-xs text-muted-foreground">{renderTip()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="px-4 py-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <MapPin className="h-4 w-4 mr-2" /> Best Destinations
          </h2>
          <button className="text-sm text-primary">See All</button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
          {destinations.map(destination => (
            <Card
              key={destination.id}
              className="min-w-[260px] shadow-soft cursor-pointer transition-all hover:shadow-lg hover:scale-105"
              onClick={() => handleDestinationClick(destination.name)}
              role="button"
              tabIndex={0}
            >
              <div className="h-40 overflow-hidden rounded-t-lg">
                <img 
                  src={destination.image} 
                  alt={destination.name} 
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardContent className="py-3">
                <h3 className="font-medium">{destination.name}</h3>
                <p className="text-xs text-muted-foreground">{destination.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
      
      <div className="px-4 py-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Palette className="h-4 w-4 mr-2" /> Culture & Art
          </h2>
          <button className="text-sm text-primary">See All</button>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4">
          {culturalSpots.map(spot => (
            <Card
              key={spot.id}
              className="min-w-[200px] shadow-soft cursor-pointer transition-all hover:shadow-lg hover:scale-105"
              onClick={() => handleCultureClick(spot.name)}
              role="button"
              tabIndex={0}
            >
              <div className="h-32 overflow-hidden rounded-t-lg">
                <img 
                  src={spot.image} 
                  alt={spot.name} 
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardContent className="py-3">
                <h3 className="font-medium text-sm">{spot.name}</h3>
                <p className="text-xs text-muted-foreground">{spot.location}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="px-4 py-2">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Calendar className="h-4 w-4 mr-2" /> Festivals & Events
          </h2>
          <button className="text-sm text-primary">See All</button>
        </div>

        <Card className="shadow-soft">
          <CardContent className="py-3">
            {events.map((event, index) => (
              <React.Fragment key={event.id}>
                <div className="py-3">
                  <div className="flex justify-between">
                    <h3 className="font-medium">{event.name}</h3>
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-full">
                      {event.date}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{event.location}</p>
                </div>
                {index < events.length - 1 && <Separator />}
              </React.Fragment>
            ))}
          </CardContent>
        </Card>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default Dashboard;
