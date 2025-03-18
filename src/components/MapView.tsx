
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import { Icon, DivIcon } from 'leaflet';
import { useNavigation } from '@/context/NavigationContext';
import { getRoutes, Route } from '@/services/routingService';
import { toast } from 'sonner';
import { AlertCircle, RefreshCw, Plane } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

// Create a custom div icon for the plane that supports rotation via CSS
const createPlaneIcon = (rotation = 0) => {
  return new DivIcon({
    html: `<div style="transform: rotate(${rotation}deg);">
             <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
               <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
             </svg>
           </div>`,
    className: '',
    iconSize: [25, 25],
    iconAnchor: [12, 12],
  });
};

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
const NavigationMarker = ({ positions, isFlightMode }: { positions: [number, number][], isFlightMode: boolean }) => {
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [currentPositionIndex, setCurrentPositionIndex] = useState(0);
  const [bearing, setBearing] = useState(0);
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
        
        // Calculate bearing (direction) between current and next position
        if (isFlightMode && nextIndex < positions.length) {
          const currentPos = positions[prev];
          const nextPos = positions[nextIndex];
          
          // Calculate bearing angle
          const startLat = currentPos[0] * Math.PI / 180;
          const startLng = currentPos[1] * Math.PI / 180;
          const destLat = nextPos[0] * Math.PI / 180;
          const destLng = nextPos[1] * Math.PI / 180;
          
          const y = Math.sin(destLng - startLng) * Math.cos(destLat);
          const x = Math.cos(startLat) * Math.sin(destLat) -
                  Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
          const bearingRad = Math.atan2(y, x);
          const bearingDeg = (bearingRad * 180 / Math.PI + 360) % 360;
          
          setBearing(bearingDeg);
        }
        
        setMarkerPosition(positions[nextIndex]);
        map.panTo(positions[nextIndex]);
        return nextIndex;
      });
    }, 500); // Update every 500ms

    return () => clearInterval(intervalId);
  }, [positions, map, isFlightMode]);

  if (!markerPosition) return null;

  // Use the appropriate icon based on the mode
  return isFlightMode ? (
    <Marker
      position={markerPosition}
      icon={createPlaneIcon(bearing)}
    />
  ) : (
    <Marker
      position={markerPosition}
      icon={sourceIcon}
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
    obstacleDetected,
    routeType
  } = useNavigation();
  
  const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
  const [alternateRouteCoords, setAlternateRouteCoords] = useState<[number, number][][]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const isFlightMode = routeType === 'flight';

  // Function to fetch routes
  const fetchRoutes = async () => {
    if (!source || !destination) return;

    setIsLoadingRoutes(true);
    setRouteError(null);

    try {
      console.log(`Fetching ${isFlightMode ? 'flight' : 'ground'} routes between`, source, 'and', destination);
      const routes = await getRoutes(source, destination, isFlightMode);
      
      if (routes && routes.length > 0) {
        // Set the first route as current route
        setCurrentRoute(routes[0]);
        
        // Convert coordinates to [lat, lng] format for Leaflet
        if (routes[0].geometry && routes[0].geometry.coordinates) {
          const coordinates = routes[0].geometry.coordinates.map(
            coord => [coord[1], coord[0]] as [number, number]
          );
          setRouteCoordinates(coordinates);
          
          // Save all routes for alternatives
          if (routes.length > 1) {
            setAlternativeRoutes(routes.slice(1));
            
            // Convert alternative routes
            const alternativeCoords = routes.slice(1).map(route => 
              route.geometry.coordinates.map(
                coord => [coord[1], coord[0]] as [number, number]
              )
            );
            setAlternateRouteCoords(alternativeCoords);
          } else {
            setAlternativeRoutes([]);
            setAlternateRouteCoords([]);
          }
          
          toast.success(`${isFlightMode ? 'Flight' : 'Route'} planned successfully!`);
        } else {
          throw new Error('Invalid route format received');
        }
      }
    } catch (error) {
      console.error('Error fetching routes:', error);
      setRouteError(`Could not fetch ${isFlightMode ? 'flight' : 'ground'} routes. Please try again.`);
      toast.error(`Could not fetch ${isFlightMode ? 'flight' : 'ground'} routes. Please try again.`);
    } finally {
      setIsLoadingRoutes(false);
    }
  };

  // Fetch routes when source and destination are set
  useEffect(() => {
    if (source && destination) {
      fetchRoutes();
    }
  }, [source, destination, routeType]);

  // Handle obstacle detection
  useEffect(() => {
    if (obstacleDetected && alternativeRoutes && alternativeRoutes.length > 0) {
      // Switch to first alternative route
      const newRoute = alternativeRoutes[0];
      setCurrentRoute(newRoute);
      
      // Update route coordinates
      if (newRoute && newRoute.geometry && newRoute.geometry.coordinates) {
        const newCoordinates = newRoute.geometry.coordinates.map(
          coord => [coord[1], coord[0]] as [number, number]
        );
        setRouteCoordinates(newCoordinates);
        
        // Update alternatives
        const remainingAlternatives = alternativeRoutes.slice(1);
        setAlternativeRoutes(remainingAlternatives);
        
        if (alternateRouteCoords.length > 1) {
          setAlternateRouteCoords(alternateRouteCoords.slice(1));
        } else {
          setAlternateRouteCoords([]);
        }
        
        toast.info(`${isFlightMode ? 'Flight path' : 'Route'} updated to avoid obstacle`);
      }
    }
  }, [obstacleDetected, alternativeRoutes, setCurrentRoute, setAlternativeRoutes, alternateRouteCoords]);

  const handleRetryRoute = () => {
    if (!source || !destination) return;
    fetchRoutes();
  };

  // If no source/destination, show loading
  if (!source || !destination) {
    return <div className="flex items-center justify-center h-64">Loading map...</div>;
  }

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden shadow-lg border border-gray-200">
      {routeError && (
        <div className="bg-red-50 p-4 rounded-lg mb-4 text-red-700 flex flex-col">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p className="font-medium">{routeError}</p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="self-start" 
            onClick={handleRetryRoute} 
            disabled={isLoadingRoutes}
          >
            {isLoadingRoutes ? 'Loading...' : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" /> Retry
              </>
            )}
          </Button>
        </div>
      )}
      
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
        <Marker position={[source.lat, source.lng]} icon={sourceIcon}>
          {isFlightMode && source.altitude && (
            <div className="bg-white p-1 text-xs rounded shadow">
              {source.altitude} ft
            </div>
          )}
        </Marker>
        
        {/* Destination marker */}
        <Marker position={[destination.lat, destination.lng]} icon={destinationIcon}>
          {isFlightMode && destination.altitude && (
            <div className="bg-white p-1 text-xs rounded shadow">
              {destination.altitude} ft
            </div>
          )}
        </Marker>
        
        {/* Main route */}
        {routeCoordinates.length > 0 && (
          <Polyline
            positions={routeCoordinates}
            color={isFlightMode ? "#3366cc" : "#3388ff"}
            weight={5}
            opacity={0.7}
            className="animate-path"
            dashArray={isFlightMode ? "5,10" : ""}
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
          <NavigationMarker 
            positions={routeCoordinates} 
            isFlightMode={isFlightMode}
          />
        )}
        
        {/* Fit map to bounds */}
        <MapFitter />
      </MapContainer>
      
      {isLoadingRoutes && (
        <div className="absolute inset-0 bg-white bg-opacity-50 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            <p>{isFlightMode ? 'Calculating flight path...' : 'Loading routes...'}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
