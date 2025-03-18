
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLocationForm, groundLocations, airports } from '@/hooks/useLocationForm';
import TransportTypeSelector from './LocationForm/TransportTypeSelector';
import CustomCoordinatesInput from './LocationForm/CustomCoordinatesInput';

const LocationForm: React.FC = () => {
  const {
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
  } = useLocationForm();

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
        <TransportTypeSelector value={transportType} onChange={setTransportType} />

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
              <CustomCoordinatesInput
                label="source"
                values={customSource}
                onChange={setCustomSource}
                showAltitude={transportType === 'flight'}
              />
            ) : (
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
              <CustomCoordinatesInput
                label="destination"
                values={customDestination}
                onChange={setCustomDestination}
                showAltitude={transportType === 'flight'}
              />
            ) : (
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
