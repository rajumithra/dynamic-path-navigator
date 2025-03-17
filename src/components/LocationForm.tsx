
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigation } from '@/context/NavigationContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MapPin, Navigation } from 'lucide-react';

const predefinedLocations = [
  // Major cities as examples
  { name: 'New York', coordinates: { lat: 40.7128, lng: -74.0060 } },
  { name: 'Los Angeles', coordinates: { lat: 34.0522, lng: -118.2437 } },
  { name: 'Chicago', coordinates: { lat: 41.8781, lng: -87.6298 } },
  { name: 'San Francisco', coordinates: { lat: 37.7749, lng: -122.4194 } },
  { name: 'Boston', coordinates: { lat: 42.3601, lng: -71.0589 } },
  { name: 'Austin', coordinates: { lat: 30.2672, lng: -97.7431 } },
  { name: 'Seattle', coordinates: { lat: 47.6062, lng: -122.3321 } },
  { name: 'Denver', coordinates: { lat: 39.7392, lng: -104.9903 } },
];

const LocationForm: React.FC = () => {
  const { setSource, setDestination } = useNavigation();
  const navigate = useNavigate();
  const [sourceLocation, setSourceLocation] = useState('');
  const [destinationLocation, setDestinationLocation] = useState('');

  const handleLocationSelect = (locationType: 'source' | 'destination', locationName: string) => {
    const location = predefinedLocations.find(loc => loc.name === locationName);
    
    if (location) {
      if (locationType === 'source') {
        setSourceLocation(locationName);
      } else {
        setDestinationLocation(locationName);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const sourceLocationObj = predefinedLocations.find(loc => loc.name === sourceLocation);
    const destinationLocationObj = predefinedLocations.find(loc => loc.name === destinationLocation);
    
    if (!sourceLocationObj || !destinationLocationObj) {
      toast.error('Please select both source and destination locations');
      return;
    }
    
    if (sourceLocation === destinationLocation) {
      toast.error('Source and destination cannot be the same');
      return;
    }
    
    // Set the coordinates in the navigation context
    setSource(sourceLocationObj.coordinates);
    setDestination(destinationLocationObj.coordinates);
    
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="source" className="flex items-center gap-1">
              <MapPin className="h-4 w-4 text-nav" /> Source Location
            </Label>
            <div className="relative">
              <div className="flex gap-2 flex-wrap">
                {predefinedLocations.slice(0, 4).map(location => (
                  <Button
                    key={`source-${location.name}`}
                    type="button"
                    variant={sourceLocation === location.name ? "default" : "outline"}
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
                {predefinedLocations.slice(4).map(location => (
                  <Button
                    key={`dest-${location.name}`}
                    type="button"
                    variant={destinationLocation === location.name ? "default" : "outline"}
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
            Start Navigation
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        Real-time navigation with obstacle detection
      </CardFooter>
    </Card>
  );
};

export default LocationForm;
