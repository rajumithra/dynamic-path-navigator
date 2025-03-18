
import { useState } from 'react';
import { useNavigation } from '@/context/NavigationContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type CustomLocation = {
  name: string;
  lat: string;
  lng: string;
  altitude: string;
};

export const useLocationForm = () => {
  const { setSource, setDestination, setRouteType } = useNavigation();
  const navigate = useNavigate();
  const [transportType, setTransportType] = useState('ground');
  
  const [sourceLocation, setSourceLocation] = useState<string>("");
  const [destinationLocation, setDestinationLocation] = useState<string>("");
  
  const [customSource, setCustomSource] = useState<CustomLocation>({
    name: '',
    lat: '',
    lng: '',
    altitude: ''
  });
  
  const [customDestination, setCustomDestination] = useState<CustomLocation>({
    name: '',
    lat: '',
    lng: '',
    altitude: ''
  });

  const [useCustomSource, setUseCustomSource] = useState(false);
  const [useCustomDestination, setUseCustomDestination] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let sourceLocationData;
    let destinationLocationData;
    
    // Handle source location
    if (useCustomSource) {
      const sourceLat = parseFloat(customSource.lat);
      const sourceLng = parseFloat(customSource.lng);
      
      if (isNaN(sourceLat) || isNaN(sourceLng)) {
        toast.error('Please enter valid source coordinates');
        return;
      }
      
      sourceLocationData = {
        name: customSource.name || `Custom (${sourceLat.toFixed(4)}, ${sourceLng.toFixed(4)})`,
        coordinates: {
          lat: sourceLat,
          lng: sourceLng,
          ...(transportType === 'flight' && { altitude: parseFloat(customSource.altitude) || 3500 })
        }
      };
    } else {
      const locations = transportType === 'ground' ? groundLocations : airports;
      const source = locations.find(loc => loc.name === sourceLocation);
      if (!source || !sourceLocation) {
        toast.error('Please select a source location');
        return;
      }
      sourceLocationData = source;
    }
    
    // Handle destination location
    if (useCustomDestination) {
      const destLat = parseFloat(customDestination.lat);
      const destLng = parseFloat(customDestination.lng);
      
      if (isNaN(destLat) || isNaN(destLng)) {
        toast.error('Please enter valid destination coordinates');
        return;
      }
      
      destinationLocationData = {
        name: customDestination.name || `Custom (${destLat.toFixed(4)}, ${destLng.toFixed(4)})`,
        coordinates: {
          lat: destLat,
          lng: destLng,
          ...(transportType === 'flight' && { altitude: parseFloat(customDestination.altitude) || 3500 })
        }
      };
    } else {
      const locations = transportType === 'ground' ? groundLocations : airports;
      const destination = locations.find(loc => loc.name === destinationLocation);
      if (!destination || !destinationLocation) {
        toast.error('Please select a destination location');
        return;
      }
      destinationLocationData = destination;
    }
    
    // Validate that source and destination are different
    const sourceCoords = sourceLocationData.coordinates;
    const destCoords = destinationLocationData.coordinates;
    
    if (sourceCoords.lat === destCoords.lat && sourceCoords.lng === destCoords.lng) {
      toast.error('Source and destination cannot be the same');
      return;
    }
    
    setSource(sourceLocationData);
    setDestination(destinationLocationData);
    setRouteType(transportType === 'ground' ? 'ground' : 'flight');
    
    toast.success(`Planning ${transportType === 'ground' ? 'route' : 'flight'} from ${sourceLocationData.name} to ${destinationLocationData.name}`);
    
    navigate('/navigation');
  };

  return {
    transportType,
    setTransportType,
    sourceLocation,
    setSourceLocation,
    destinationLocation,
    setDestinationLocation,
    customSource,
    setCustomSource,
    customDestination,
    setCustomDestination,
    useCustomSource,
    setUseCustomSource,
    useCustomDestination,
    setUseCustomDestination,
    handleSubmit
  };
};

export const groundLocations = [
  { name: 'New York', coordinates: { lat: 40.7128, lng: -74.0060 } },
  { name: 'Los Angeles', coordinates: { lat: 34.0522, lng: -118.2437 } },
  { name: 'Chicago', coordinates: { lat: 41.8781, lng: -87.6298 } },
  { name: 'San Francisco', coordinates: { lat: 37.7749, lng: -122.4194 } },
  { name: 'Boston', coordinates: { lat: 42.3601, lng: -71.0589 } },
  { name: 'Austin', coordinates: { lat: 30.2672, lng: -97.7431 } },
  { name: 'Seattle', coordinates: { lat: 47.6062, lng: -122.3081 } },
  { name: 'Denver', coordinates: { lat: 39.7392, lng: -104.9903 } },
];

export const airports = [
  { name: 'JFK Airport', coordinates: { lat: 40.6413, lng: -73.7781, altitude: 4000 } },
  { name: 'LAX Airport', coordinates: { lat: 33.9416, lng: -118.4085, altitude: 3500 } },
  { name: 'ORD Airport', coordinates: { lat: 41.9742, lng: -87.9073, altitude: 3800 } },
  { name: 'SFO Airport', coordinates: { lat: 37.6213, lng: -122.3790, altitude: 4100 } },
  { name: 'BOS Airport', coordinates: { lat: 42.3656, lng: -71.0096, altitude: 3700 } },
  { name: 'AUS Airport', coordinates: { lat: 30.1975, lng: -97.6664, altitude: 3200 } },
  { name: 'SEA Airport', coordinates: { lat: 47.4502, lng: -122.3088, altitude: 3600 } },
  { name: 'DEN Airport', coordinates: { lat: 39.8561, lng: -104.6737, altitude: 5200 } },
];
