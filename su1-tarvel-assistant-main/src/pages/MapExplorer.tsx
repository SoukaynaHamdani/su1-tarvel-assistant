import React, { useEffect, useState } from "react";
import BottomNavigation from "@/components/BottomNavigation";
import MapSection from "@/components/MapSection";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useSearchParams } from "react-router-dom";
import { getCurrentUserId } from '@/services/FirebaseService';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/services/FirebaseService';

// Helper function to geocode a place name to coordinates using Mapbox
async function geocodeLocation(query: string, mapboxToken: string): Promise<[number, number] | null> {
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
    query
  )}.json?access_token=${mapboxToken}&limit=1`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.features && data.features.length > 0) {
    const [lon, lat] = data.features[0].center;
    return [lon, lat];
  }
  return null;
}

// Helper function to get route coordinates from Mapbox Directions API
async function getRoutePoints(start: [number, number], end: [number, number], mapboxToken: string): Promise<[number, number][]> {
  const url =
    `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?` +
    `geometries=geojson&steps=false&access_token=${mapboxToken}`;
  const res = await fetch(url);
  const data = await res.json();
  if (
    data.routes &&
    data.routes[0] &&
    data.routes[0].geometry &&
    data.routes[0].geometry.coordinates
  ) {
    return data.routes[0].geometry.coordinates;
  }
  return [];
}

// Helper function to find cities along route (simple sampling)
async function findCitiesAlongRoute(route: [number, number][], mapboxToken: string): Promise<{coordinates: [number, number]; name: string;}[]> {
  if (route.length < 5) return [];
  // Take every ~1/3rd along the route for POI search (3 POIs)
  const indices = [Math.floor(route.length/5), Math.floor(route.length/2), Math.floor((route.length-1)*4/5)];
  const pois: {coordinates: [number, number]; name: string;}[] = [];
  for (let i=0; i<indices.length; i++) {
    const point = route[indices[i]];
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${point[0]},${point[1]}.json?` +
      `types=place&access_token=${mapboxToken}&limit=1`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.features && data.features[0]) {
      pois.push({
        coordinates: [data.features[0].center[0], data.features[0].center[1]],
        name: data.features[0].text,
      });
    }
  }
  return pois;
}

const DEFAULT_MAPBOX_TOKEN = "pk.eyJ1IjoiZXNncnNnIiwiYSI6ImNtOXFqMmp2YjFhbzIya3I3bTVsZXlnd3MifQ.QMLGWTq1O-EIf28laDzRbA";

const MapExplorer = () => {
  const [searchParams] = useSearchParams();
  const [startLocation, setStartLocation] = useState("");
  const destinationParam = searchParams.get("destination") || "";
  const [endLocation, setEndLocation] = useState(destinationParam);
  const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const [poiMarkers, setPoiMarkers] = useState<{coordinates: [number, number]; name: string;}[]>([]);
  const [mapboxToken, setMapboxToken] = useState(DEFAULT_MAPBOX_TOKEN);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const currentUserId = getCurrentUserId();
    setUserId(currentUserId);
  }, []);

  useEffect(() => {
    if (destinationParam && endLocation !== destinationParam) {
      setEndLocation(destinationParam);
    }
  }, [destinationParam]);

  const saveRouteToDatabase = async (startLoc: string, endLoc: string, pois: {coordinates: [number, number]; name: string;}[]) => {
    try {
      if (!userId) {
        console.log("No user ID available, not saving route");
        return;
      }

      await addDoc(collection(db, 'routes'), {
        userId,
        startLocation: startLoc,
        endLocation: endLoc,
        pointsOfInterest: pois.map(poi => poi.name),
        timestamp: new Date()
      });
      
      console.log('Route saved to database');
    } catch (error) {
      console.error('Error saving route to database:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startLocation || !endLocation) {
      toast.error("Please enter both start and end locations");
      return;
    }

    setIsCalculatingRoute(true);
    setRoutePoints([]);
    setPoiMarkers([]);

    try {
      // 1. Geocode both locations
      const [startCoords, endCoords] = await Promise.all([
        geocodeLocation(startLocation, mapboxToken),
        geocodeLocation(endLocation, mapboxToken),
      ]);
      if (!startCoords || !endCoords) {
        toast.error("Unable to find start or end location. Please check your input.");
        setIsCalculatingRoute(false);
        return;
      }

      // 2. Get route polyline points
      const route = await getRoutePoints(startCoords, endCoords, mapboxToken);
      if (route.length < 2) {
        toast.error("Could not calculate a drivable route between locations.");
        setIsCalculatingRoute(false);
        return;
      }
      setRoutePoints(route);

      // 3. Find sample cities along the route
      const pois = await findCitiesAlongRoute(route, mapboxToken);
      const allMarkers = [
        { coordinates: startCoords, name: startLocation + " (Start)" },
        ...pois,
        { coordinates: endCoords, name: endLocation + " (End)" },
      ];
      setPoiMarkers(allMarkers);
      
      // 4. Save the route to the database
      await saveRouteToDatabase(startLocation, endLocation, pois);
      
      setIsCalculatingRoute(false);
      toast.success("Route and interesting stops found! Click markers on the map.");
    } catch (error) {
      console.error("Error calculating route:", error);
      setIsCalculatingRoute(false);
      toast.error("Failed to calculate route. Please try again.");
    }
  };

  return (
    <div className="pb-20 animate-fade-in min-h-screen flex flex-col bg-sky-50">
      <div className="bg-primary text-primary-foreground p-6">
        <h1 className="text-xl font-semibold">Map Explorer</h1>
        <p className="text-sm opacity-90">
          Plan your route and discover attractions along the way!
        </p>
      </div>

      <div className="bg-white shadow-md rounded-lg mx-4 mt-4 p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 space-y-2">
              <label htmlFor="start" className="text-sm font-medium text-gray-700">Starting Point</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="start"
                  placeholder="e.g. Rome"
                  className="pl-8"
                  value={startLocation}
                  onChange={(e) => setStartLocation(e.target.value)}
                />
              </div>
            </div>

            <div className="hidden md:flex items-end justify-center pb-2">
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="flex-1 space-y-2">
              <label htmlFor="end" className="text-sm font-medium text-gray-700">Destination</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="end"
                  placeholder="e.g. Paris"
                  className="pl-8"
                  value={endLocation}
                  onChange={(e) => setEndLocation(e.target.value)}
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500"
            disabled={isCalculatingRoute}
          >
            {isCalculatingRoute ? "Finding Best Route..." : "Plan My Journey"}
          </Button>
        </form>
      </div>

      <div className="flex-1 flex flex-col items-center justify-start p-4">
        <MapSection routePoints={routePoints} poiMarkers={poiMarkers} />
      </div>

      <BottomNavigation />
    </div>
  );
};

export default MapExplorer;
