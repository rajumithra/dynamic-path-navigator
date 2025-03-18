
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigation } from '@/context/NavigationContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MapPin, Navigation, Plane } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

const groundLocations = [
  { name: 'New York', coordinates: { lat: 40.7128, lng: -74.0060 } },
  { name: 'Los Angeles', coordinates: { lat: 34.0522, lng: -118.2437 } },
  { name: 'Chicago', coordinates: { lat: 41.8781, lng: -87.6298 } },
  { name: 'San Francisco', coordinates: { lat: 37.7749, lng: -122.4194 } },
  { name: 'Boston', coordinates: { lat: 42.3601, lng: -71.0589 } },
  { name: 'Austin', coordinates: { lat: 30.2672, lng: -97.7431 } },
  { name: 'Seattle', coordinates: { lat: 47.6062, lng: -122.3321 } },
  { name: 'Denver', coordinates: { lat: 39.7392, lng: -104.9903 } },
];

const airports = [
  { name: 'JFK Airport', coordinates: { lat: 40.6413, lng: -73.7781, altitude: 4000 } },
  { name: 'LAX Airport', coordinates: { lat: 33.9416, lng: -118.4085, altitude: 3500 } },
  { name: 'ORD Airport', coordinates: { lat: 41.9742, lng: -87.9073, altitude: 3800 } },
  { name: 'SFO Airport', coordinates: { lat: 37.6213, lng: -122.3790, altitude: 4100 } },
  { name: 'BOS Airport', coordinates: { lat: 42.3656, lng: -71.0096, altitude: 3700 } },
  { name: 'AUS Airport', coordinates: { lat: 30.1975, lng: -97.6664, altitude: 3200 } },
  { name: 'SEA Airport', coordinates: { lat: 47.4502, lng: -122.3088, altitude: 3600 } },
  { name: 'DEN Airport', coordinates: { lat: 39.8561, lng: -104.6737, altitude: 5200 } },
];

const LocationForm: React.FC = () => {
  const { setSource, setDestination, setRouteType } = useNavigation();
  const navigate = useNavigate();
  const [selectedSource, setSelectedSource] = useState('');
  const [selectedDestination, setSelectedDestination] = useState('');
  const [transportType, setTransportType] = useState('ground');

  const handleLocationSelect = (locationType: 'source' | 'destination', locationName: string) => {
    if (transportType === 'ground') {
      const location = groundLocations.find(loc => loc.name === locationName);
      if (location) {
        if (locationType === 'source') {
          setSelectedSource(locationName);
        } else {
          setSelectedDestination(locationName);
        }
      }
    } else {
      const location = airports.find(loc => loc.name === locationName);
      if (location) {
        if (locationType === 'source') {
          setSelectedSource(locationName);
        } else {
          setSelectedDestination(locationName);
        }
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let sourceLocationObj;
    let destinationLocationObj;
    
    if (transportType === 'ground') {
      sourceLocationObj = groundLocations.find(loc => loc.name === selectedSource);
      destinationLocationObj = groundLocations.find(loc => loc.name === selectedDestination);
    } else {
      sourceLocationObj = airports.find(loc => loc.name === selectedSource);
      destinationLocationObj = airports.find(loc => loc.name === selectedDestination);
    }
    
    if (!sourceLocationObj || !destinationLocationObj) {
      toast.error('Please select both source and destination locations');
      return;
    }
    
    if (selectedSource === selectedDestination) {
      toast.error('Source and destination cannot be the same');
      return;
    }
    
    // Set the coordinates in the navigation context
    setSource(sourceLocationObj.coordinates);
    setDestination(destinationLocationObj.coordinates);
    setRouteType(transportType === 'ground' ? 'ground' : 'flight');
    
    // Show success message
    toast.success(`Planning ${transportType === 'ground' ? 'route' : 'flight'} from ${selectedSource} to ${selectedDestination}`);
    
    // Navigate to the navigation page
    navigate('/navigation');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Navigation Planner</CardTitle>
        <CardDescription className="text-center">
          Select source and destination for your journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ground" onValueChange={setTransportType} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="ground" className="flex items-center gap-2">
              <Navigation className="h-4 w-4" /> Ground
            </TabsTrigger>
            <TabsTrigger value="flight" className="flex items-center gap-2">
              <Plane className="h-4 w-4" /> Flight ✈️
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="ground">
            <p className="text-sm text-muted-foreground mb-4">
              Plan a ground transportation route with obstacle detection
            </p>
          </TabsContent>
          
          <TabsContent value="flight">
            <p className="text-sm text-muted-foreground mb-4">
              Plan a flight route with real-time airspace obstacle detection
            </p>
          </TabsContent>
        </Tabs>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="source" className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-nav" /> Source Location
            </Label>
            <div className="relative">
              <div className="flex gap-2 flex-wrap">
                {(transportType === 'ground' ? groundLocations : airports).slice(0, 4).map(location => (
                  <Button
                    key={`source-${location.name}`}
                    type="button"
                    variant={selectedSource === location.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleLocationSelect('source', location.name)}
                    className="text-sm"
                  >
                    {location.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="destination" className="flex items-center gap-1">
              <Navigation className="h-4 w-4 text-nav-secondary" /> Destination
            </Label>
            <div className="relative">
              <div className="flex gap-2 flex-wrap">
                {(transportType === 'ground' ? groundLocations : airports).slice(4).map(location => (
                  <Button
                    key={`dest-${location.name}`}
                    type="button"
                    variant={selectedDestination === location.name ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleLocationSelect('destination', location.name)}
                    className="text-sm"
                  >
                    {location.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <Button type="submit" className="w-full bg-nav hover:bg-nav-accent">
            {transportType === 'ground' ? 'Start Navigation' : 'Plan Flight ✈️'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        {transportType === 'ground' ? 'Real-time navigation with obstacle detection' : 'Flight path planning with airspace monitoring'}
      </CardFooter>
    </Card>
  );
};

export default LocationForm;
