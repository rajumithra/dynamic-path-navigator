import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigation } from '@/context/NavigationContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MapPin, Navigation, Plane } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const groundLocations = [
  { name: 'New York', coordinates: { lat: 40.7128, lng: -74.0060 } },
  { name: 'Los Angeles', coordinates: { lat: 34.0522, lng: -118.2437 } },
  { name: 'Chicago', coordinates: { lat: 41.8781, lng: -87.6298 } },
  { name: 'San Francisco', coordinates: { lat: 37.7749, lng: -122.4194 } },
  { name: 'Boston', coordinates: { lat: 42.3601, lng: -71.0589 } },
  { name: 'Austin', coordinates: { lat: 30.2672, lng: -97.7431 } },
  { name: 'Seattle', coordinates: { lat: 47.6062, lng: -122.3081 } },
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
  const [transportType, setTransportType] = useState('ground');
  
  const [customSource, setCustomSource] = useState({
    lat: '',
    lng: '',
    altitude: ''
  });
  const [customDestination, setCustomDestination] = useState({
    lat: '',
    lng: '',
    altitude: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let sourceCoords;
    let destinationCoords;
    
    const sourceLat = parseFloat(customSource.lat);
    const sourceLng = parseFloat(customSource.lng);
    const destLat = parseFloat(customDestination.lat);
    const destLng = parseFloat(customDestination.lng);
    
    if (isNaN(sourceLat) || isNaN(sourceLng) || isNaN(destLat) || isNaN(destLng)) {
      toast.error('Please enter valid coordinates');
      return;
    }

    if (sourceLat === destLat && sourceLng === destLng) {
      toast.error('Source and destination cannot be the same');
      return;
    }

    if (transportType === 'flight') {
      const sourceAlt = parseFloat(customSource.altitude) || 3500;
      const destAlt = parseFloat(customDestination.altitude) || 3500;
      
      sourceCoords = { lat: sourceLat, lng: sourceLng, altitude: sourceAlt };
      destinationCoords = { lat: destLat, lng: destLng, altitude: destAlt };
    } else {
      sourceCoords = { lat: sourceLat, lng: sourceLng };
      destinationCoords = { lat: destLat, lng: destLng };
    }
    
    setSource(sourceCoords);
    setDestination(destinationCoords);
    setRouteType(transportType === 'ground' ? 'ground' : 'flight');
    
    toast.success(`Planning ${transportType === 'ground' ? 'route' : 'flight'} from (${sourceLat}, ${sourceLng}) to (${destLat}, ${destLng})`);
    
    navigate('/navigation');
  };

  const handleLocationSelect = (locationType: 'source' | 'destination', location: any) => {
    if (locationType === 'source') {
      setCustomSource({
        lat: location.coordinates.lat.toString(),
        lng: location.coordinates.lng.toString(),
        altitude: location.coordinates.altitude?.toString() || ''
      });
    } else {
      setCustomDestination({
        lat: location.coordinates.lat.toString(),
        lng: location.coordinates.lng.toString(),
        altitude: location.coordinates.altitude?.toString() || ''
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Navigation Planner</CardTitle>
        <CardDescription className="text-center">
          Enter coordinates or select from suggestions
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
          <div className="space-y-4">
            <Label className="text-base font-medium">Source Location</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="sourceLat">Latitude</Label>
                <Input
                  id="sourceLat"
                  placeholder="Enter latitude"
                  value={customSource.lat}
                  onChange={(e) => setCustomSource(prev => ({ ...prev, lat: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="sourceLng">Longitude</Label>
                <Input
                  id="sourceLng"
                  placeholder="Enter longitude"
                  value={customSource.lng}
                  onChange={(e) => setCustomSource(prev => ({ ...prev, lng: e.target.value }))}
                />
              </div>
              {transportType === 'flight' && (
                <div className="col-span-2">
                  <Label htmlFor="sourceAlt">Altitude (ft)</Label>
                  <Input
                    id="sourceAlt"
                    placeholder="Enter altitude (optional)"
                    value={customSource.altitude}
                    onChange={(e) => setCustomSource(prev => ({ ...prev, altitude: e.target.value }))}
                  />
                </div>
              )}
            </div>

            <div className="mt-2">
              <Label className="text-sm text-muted-foreground">Suggestions:</Label>
              <div className="flex gap-2 flex-wrap mt-1">
                {(transportType === 'ground' ? groundLocations : airports).slice(0, 4).map(location => (
                  <Button
                    key={`source-${location.name}`}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleLocationSelect('source', location)}
                    className="text-xs"
                  >
                    {location.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-medium">Destination Location</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="destLat">Latitude</Label>
                <Input
                  id="destLat"
                  placeholder="Enter latitude"
                  value={customDestination.lat}
                  onChange={(e) => setCustomDestination(prev => ({ ...prev, lat: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="destLng">Longitude</Label>
                <Input
                  id="destLng"
                  placeholder="Enter longitude"
                  value={customDestination.lng}
                  onChange={(e) => setCustomDestination(prev => ({ ...prev, lng: e.target.value }))}
                />
              </div>
              {transportType === 'flight' && (
                <div className="col-span-2">
                  <Label htmlFor="destAlt">Altitude (ft)</Label>
                  <Input
                    id="destAlt"
                    placeholder="Enter altitude (optional)"
                    value={customDestination.altitude}
                    onChange={(e) => setCustomDestination(prev => ({ ...prev, altitude: e.target.value }))}
                  />
                </div>
              )}
            </div>

            <div className="mt-2">
              <Label className="text-sm text-muted-foreground">Suggestions:</Label>
              <div className="flex gap-2 flex-wrap mt-1">
                {(transportType === 'ground' ? groundLocations : airports).slice(4).map(location => (
                  <Button
                    key={`dest-${location.name}`}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleLocationSelect('destination', location)}
                    className="text-xs"
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
    </Card>
  );
};

export default LocationForm;
