
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useNavigation } from '@/context/NavigationContext';
import { getRoutes } from '@/services/routingService';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';

// Custom map icons
const sourceIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const destinationIcon = new Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Helper component to fit map to bounds
const MapFitter = () => {
  const map = useMap();
  const { source, destination, currentRoute } = useNavigation();

  useEffect(() => {
    if (source && destination) {
      const bounds = [
        [source.lat, source.lng],
        [destination.lat, destination.lng],
      ];
      map.fitBounds(bounds as any);
    }
  }, [map, source, destination, currentRoute]);

  return null;
};

// Navigation marker that moves along the path
const NavigationMarker = ({ positions }: { positions: [number, number][] }) => {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) return;

    // Start at first position
    setMarkerPosition(positions[0]);
    setCurrentPositionIndex(0);

    // Move marker along path
    const intervalId = setInterval(() => {
      setCurrentPositionIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex >= positions.length) {
          clearInterval(intervalId);
          return prev;
        }
        
        setMarkerPosition(positions[nextIndex]);
        map.panTo(positions[nextIndex]);
        return nextIndex;
      });
    }, 500); // Update every 500ms

    return () => clearInterval(intervalId);
  }, [positions, map]);

  if (!markerPosition) return null;

  return (
    <Marker
      position={markerPosition}
      icon={new Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })}
    />
  );
};

const MapView: React.FC = () => {
  const { 
    source, 
    destination, 
    setAlternativeRoutes, 
    setCurrentRoute,
    currentRoute, 
    alternativeRoutes,
    obstacleDetected
  } = useNavigation();
  
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [alternateRouteCoords, setAlternateRouteCoords] = useState<[number, number][][]>([]);

  // Fetch routes when source and destination are set
  useEffect(() => {
    async function fetchRoutes() {
      if (!source || !destination) return;

      try {
        const routes = await getRoutes(source, destination);
        
        if (routes && routes.length > 0) {
          // Set the first route as current route
          setCurrentRoute(routes[0]);
          
          // Convert coordinates to [lat, lng] format for Leaflet
          const coordinates = routes[0].geometry.coordinates.map(
            coord => [coord[1], coord[0]] as [number, number]
          );
          setRouteCoordinates(coordinates);
          
          // Save all routes for alternatives
          setAlternativeRoutes(routes.slice(1));
          
          // Convert alternative routes
          const alternativeCoords = routes.slice(1).map(route => 
            route.geometry.coordinates.map(
              coord => [coord[1], coord[0]] as [number, number]
            )
          );
          setAlternateRouteCoords(alternativeCoords);
          
          toast.success('Route planned successfully!');
        }
      } catch (error) {
        console.error('Error fetching routes:', error);
        toast.error('Could not fetch routes. Please try again.');
      }
    }

    fetchRoutes();
  }, [source, destination, setAlternativeRoutes, setCurrentRoute]);

  // Handle obstacle detection
  useEffect(() => {
    if (obstacleDetected && alternativeRoutes && alternativeRoutes.length > 0) {
      // Switch to first alternative route
      const newRoute = alternativeRoutes[0];
      setCurrentRoute(newRoute);
      
      // Update route coordinates
      const newCoordinates = newRoute.geometry.coordinates.map(
        coord => [coord[1], coord[0]] as [number, number]
      );
      setRouteCoordinates(newCoordinates);
      
      // Update alternatives
      setAlternativeRoutes(alternativeRoutes.slice(1));
      setAlternateRouteCoords(alternateRouteCoords.slice(1));
      
      toast.info('Route updated to avoid obstacle');
    }
  }, [obstacleDetected, alternativeRoutes, setCurrentRoute, setAlternativeRoutes, alternateRouteCoords]);

  // If no source/destination, show loading
  if (!source || !destination) {
    return <div className="flex items-center justify-center h-64">Loading map...</div>;
  }

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden shadow-lg border border-gray-200">
      <MapContainer
        center={[source.lat, source.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Source marker */}
        <Marker position={[source.lat, source.lng]} icon={sourceIcon} />
        
        {/* Destination marker */}
        <Marker position={[destination.lat, destination.lng]} icon={destinationIcon} />
        
        {/* Main route */}
        {routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            color="#3388ff"
            weight={5}
            opacity={0.7}
            className="animate-path"
          />
        )}
        
        {/* Alternative routes (shown with different styles) */}
        {alternateRouteCoords.map((route, index) => (
          <Polyline
            key={`alt-route-${index}`}
            positions={route}
            color="#888"
            weight={3}
            opacity={0.5}
            dashArray="5,10"
          />
        ))}
        
        {/* Moving navigation marker */}
        {routeCoordinates.length > 0 && (
          <NavigationMarker positions={routeCoordinates} />
        )}
        
        {/* Fit map to bounds */}
        <MapFitter />
      </MapContainer>
    </div>
  );
};

export default MapView;
