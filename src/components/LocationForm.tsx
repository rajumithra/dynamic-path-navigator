
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigation } from '@/context/NavigationContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { MapPin, Navigation, Plane, Search } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  
  const [sourceLocation, setSourceLocation] = useState<string>("");
  const [destinationLocation, setDestinationLocation] = useState<string>("");
  
  const [customSource, setCustomSource] = useState({
    name: '',
    lat: '',
    lng: '',
    altitude: ''
  });
  
  const [customDestination, setCustomDestination] = useState({
    name: '',
    lat: '',
    lng: '',
    altitude: ''
  });

  const [useCustomSource, setUseCustomSource] = useState(false);
  const [useCustomDestination, setUseCustomDestination] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let sourceLocation;
    let destinationLocation;
    
    // Handle source location
    if (useCustomSource) {
      const sourceLat = parseFloat(customSource.lat);
      const sourceLng = parseFloat(customSource.lng);
      
      if (isNaN(sourceLat) || isNaN(sourceLng)) {
        toast.error('Please enter valid source coordinates');
        return;
      }
      
      let sourceCoords = { lat: sourceLat, lng: sourceLng };
      if (transportType === 'flight') {
        sourceCoords.altitude = parseFloat(customSource.altitude) || 3500;
      }
      
      sourceLocation = {
        name: customSource.name || `Custom (${sourceLat.toFixed(4)}, ${sourceLng.toFixed(4)})`,
        coordinates: sourceCoords
      };
    } else {
      const locations = transportType === 'ground' ? groundLocations : airports;
      const source = locations.find(loc => loc.name === sourceLocation);
      if (!source) {
        toast.error('Please select a source location');
        return;
      }
      sourceLocation = source;
    }
    
    // Handle destination location
    if (useCustomDestination) {
      const destLat = parseFloat(customDestination.lat);
      const destLng = parseFloat(customDestination.lng);
      
      if (isNaN(destLat) || isNaN(destLng)) {
        toast.error('Please enter valid destination coordinates');
        return;
      }
      
      let destCoords = { lat: destLat, lng: destLng };
      if (transportType === 'flight') {
        destCoords.altitude = parseFloat(customDestination.altitude) || 3500;
      }
      
      destinationLocation = {
        name: customDestination.name || `Custom (${destLat.toFixed(4)}, ${destLng.toFixed(4)})`,
        coordinates: destCoords
      };
    } else {
      const locations = transportType === 'ground' ? groundLocations : airports;
      const destination = locations.find(loc => loc.name === destinationLocation);
      if (!destination) {
        toast.error('Please select a destination location');
        return;
      }
      destinationLocation = destination;
    }
    
    // Validate that source and destination are different
    const sourceCoords = sourceLocation.coordinates;
    const destCoords = destinationLocation.coordinates;
    
    if (sourceCoords.lat === destCoords.lat && sourceCoords.lng === destCoords.lng) {
      toast.error('Source and destination cannot be the same');
      return;
    }
    
    setSource(sourceLocation);
    setDestination(destinationLocation);
    setRouteType(transportType === 'ground' ? 'ground' : 'flight');
    
    toast.success(`Planning ${transportType === 'ground' ? 'route' : 'flight'} from ${sourceLocation.name} to ${destinationLocation.name}`);
    
    navigate('/navigation');
  };

  const handleToggleCustomSource = () => {
    setUseCustomSource(!useCustomSource);
    if (!useCustomSource) {
      setSourceLocation("");
    }
  };

  const handleToggleCustomDestination = () => {
    setUseCustomDestination(!useCustomDestination);
    if (!useCustomDestination) {
      setDestinationLocation("");
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Navigation Planner</CardTitle>
        <CardDescription className="text-center">
          Choose locations or enter coordinates for your journey
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
            <div className="flex justify-between items-center">
              <Label className="text-base font-medium">Source Location</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleToggleCustomSource}
                className="text-xs flex items-center gap-1"
              >
                {useCustomSource ? "Select Location" : "Custom Coordinates"}
                {useCustomSource ? <MapPin className="h-3 w-3" /> : <Search className="h-3 w-3" />}
              </Button>
            </div>
            
            {useCustomSource ? (
              <div className="space-y-3">
                <div className="w-full">
                  <Label htmlFor="sourceName">Location Name (optional)</Label>
                  <Input
                    id="sourceName"
                    placeholder="Enter a name for this location"
                    value={customSource.name}
                    onChange={(e) => setCustomSource(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
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
              </div>
            ) : (
              <div>
                <Select value={sourceLocation} onValueChange={setSourceLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {(transportType === 'ground' ? groundLocations : airports).map(location => (
                        <SelectItem key={`src-${location.name}`} value={location.name}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-medium">Destination Location</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={handleToggleCustomDestination}
                className="text-xs flex items-center gap-1"
              >
                {useCustomDestination ? "Select Location" : "Custom Coordinates"}
                {useCustomDestination ? <MapPin className="h-3 w-3" /> : <Search className="h-3 w-3" />}
              </Button>
            </div>
            
            {useCustomDestination ? (
              <div className="space-y-3">
                <div className="w-full">
                  <Label htmlFor="destName">Location Name (optional)</Label>
                  <Input
                    id="destName"
                    placeholder="Enter a name for this location"
                    value={customDestination.name}
                    onChange={(e) => setCustomDestination(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
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
              </div>
            ) : (
              <div>
                <Select value={destinationLocation} onValueChange={setDestinationLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {(transportType === 'ground' ? groundLocations : airports).map(location => (
                        <SelectItem key={`dest-${location.name}`} value={location.name}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            )}
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
