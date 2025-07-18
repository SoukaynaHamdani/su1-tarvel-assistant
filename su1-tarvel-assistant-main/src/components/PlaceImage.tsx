
import React from 'react';
import { usePlaceDescription } from "./hooks/usePlaceDescription";

interface PlaceImageProps {
  name: string;
  index: number;
}

// Collection of travel images to cycle through
const travelImages = [
  '/photo-1482938289607-e9573fc25ebb',
  '/photo-1433086966358-54859d0ed716',
  '/photo-1472396961693-142e6e269027',
  '/photo-1426604966848-d7adac402bff',
  '/photo-1500673922987-e212871fec22',
  '/photo-1506744038136-46273834b3fb',
];

const PlaceImage: React.FC<PlaceImageProps> = ({ name, index }) => {
  // Use a consistent image for the same place name
  const imageIndex = Math.abs(name.charCodeAt(0) + index) % travelImages.length;
  const imageUrl = `https://images.unsplash.com${travelImages[imageIndex]}?auto=format&fit=crop&w=300&h=200`;

  // Fetch description and famous thing for this place
  const { description, famousFor, loading } = usePlaceDescription(name);

  return (
    <div className="flex flex-col items-center">
      <div className="w-full h-[120px] overflow-hidden rounded-lg mb-2">
        <img 
          src={imageUrl} 
          alt={name}
          className="w-full h-full object-cover transition-transform hover:scale-110 duration-500"
        />
      </div>
      <span className="text-sm font-medium text-blue-800 mb-1">{name}</span>
      <div className="w-full min-h-[56px] flex flex-col items-start justify-start">
        {loading ? (
          <div className="animate-pulse text-xs text-blue-500/80">
            Loading info...
          </div>
        ) : (
          <>
            {description && (
              <div className="text-xs text-blue-900 mb-1">{description}</div>
            )}
            {famousFor && (
              <div className="text-xs text-orange-700/90 font-semibold italic">Famous for: {famousFor}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PlaceImage;
