import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import PlaceImage from './PlaceImage';

const DEFAULT_CENTER: [number, number] = [12, 48]; // Center in the Mediterranean for a more global default

const MAPBOX_TOKEN = 'pk.eyJ1IjoiZXNncnNnIiwiYSI6ImNtOXFqMmp2YjFhbzIya3I3bTVsZXlnd3MifQ.QMLGWTq1O-EIf28laDzRbA';

// Use a light/modern style for travel vibe
const MODERN_STYLE = 'mapbox://styles/mapbox/light-v11';

interface MapSectionProps {
  routePoints?: [number, number][];
  poiMarkers?: {coordinates: [number, number]; name: string;}[];
}

const MapSection: React.FC<MapSectionProps> = ({ routePoints = [], poiMarkers = [] }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return;

    mapboxgl.accessToken = MAPBOX_TOKEN;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MODERN_STYLE,
      center: DEFAULT_CENTER,
      zoom: 6,
      pitch: 35,
      bearing: -5,
      projection: 'globe',
      antialias: true,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.on('style.load', () => {
      map.current?.setFog({
        color: 'rgb(245, 252, 226)',
        'high-color': 'rgb(200, 244, 233)',
        'horizon-blend': 0.05,
      });
      setMapLoaded(true);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Helper function to add markers
  const addMarker = (
    coords: [number, number],
    title: string,
    emoji: string = '📍'
  ) => {
    if (!map.current) return;
    // Differentiate start/end/poi
    let color = "#38bdf8";
    if (title.includes("(Start)")) color = "#22c55e";
    if (title.includes("(End)")) color = "#f59e42";
    const marker = new mapboxgl.Marker({ color })
      .setLngLat(coords)
      .setPopup(
        new mapboxgl.Popup({ closeOnClick: true }).setHTML(
          `<div style="font-family:Poppins,sans-serif;font-weight:600;font-size:1rem; text-align:center; color:#0891b2;">
            ${emoji} ${title}
          </div>`
        )
      )
      .addTo(map.current);
    markersRef.current.push(marker);
  };

  // Update map when route points or POIs change
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add POI markers
    if (poiMarkers && poiMarkers.length > 0) {
      poiMarkers.forEach((poi, idx) => {
        let emoji = '📍';
        if (poi.name.toLowerCase().includes("start")) emoji = '🚩';
        else if (poi.name.toLowerCase().includes("end")) emoji = '🏁';
        addMarker(poi.coordinates, poi.name, emoji);
      });
    } else {
      // Still display default world marker
      addMarker(DEFAULT_CENTER, 'Explore the world!');
    }

    // Draw the route line between points
    if (routePoints.length > 1) {
      // Remove old route if exists
      if (map.current.getLayer('route')) {
        map.current.removeLayer('route');
      }
      if (map.current.getSource('route')) {
        map.current.removeSource('route');
      }
      map.current.addSource('route', {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routePoints
          }
        }
      });
      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#0284c7',
          'line-width': 4,
          'line-opacity': 0.8
        }
      });
    } else {
      if (map.current.getLayer('route')) {
        map.current.removeLayer('route');
      }
      if (map.current.getSource('route')) {
        map.current.removeSource('route');
      }
    }

    // Fit map to show all points if route exists
    if (routePoints.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      routePoints.forEach(point => bounds.extend(point as mapboxgl.LngLatLike));
      map.current.fitBounds(bounds, {
        padding: 100,
        maxZoom: 10,
        duration: 2000
      });
    } else {
      map.current.setCenter(DEFAULT_CENTER);
      map.current.setZoom(6);
    }
  }, [routePoints, poiMarkers, mapLoaded]);

  // Filter out start and end points to only show POIs in the images gallery
  const pointsOfInterest = poiMarkers.filter(
    poi => !poi.name.includes("(Start)") && !poi.name.includes("(End)")
  );

  return (
    <section className="w-full flex flex-col items-center px-2 py-4 bg-gradient-to-br from-blue-50/60 via-sky-100/75 to-white rounded-3xl shadow-soft mb-8">
      <h2 className="text-xl md:text-2xl font-bold mb-2 text-sky-700 drop-shadow-sm">
        {routePoints.length > 0 ? "🗺️ Your Journey" : "🌏 Explore Tourist Destinations!"}
      </h2>
      <p className="text-sm md:text-base mb-5 text-blue-700/70 max-w-lg text-center">
        {routePoints.length > 0
          ? "Here's your journey and stops along the way. Click a marker to learn more."
          : "Enter your start and end locations to plan your trip and see stops along the route!"}
      </p>
      <div
        ref={mapContainer}
        className="w-full h-72 md:h-[420px] rounded-2xl shadow-lg border border-sky-200 overflow-hidden"
        style={{ maxWidth: "750px", background: "linear-gradient(135deg,#e3f1fa 0%,#c9e5fc 100%)" }}
      />
      
      {/* Display images of places along the route */}
      {pointsOfInterest.length > 0 && (
        <div className="mt-6 w-full max-w-[750px]">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">
            ✨ Places to Visit Along Your Route:
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {pointsOfInterest.map((poi, index) => (
              <PlaceImage 
                key={index}
                name={poi.name.replace(/\s*\([^)]*\)\s*/g, '')} // Remove anything in parentheses
                index={index} 
              />
            ))}
          </div>
        </div>
      )}
      
      <p className="text-xs mt-2 opacity-60 text-blue-900">
        Try dragging or zooming the map!
      </p>
    </section>
  );
};

export default MapSection;
