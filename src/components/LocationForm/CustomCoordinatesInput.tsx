
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

type CustomCoordinatesInputProps = {
  label: string;
  values: {
    name: string;
    lat: string;
    lng: string;
    altitude: string;
  };
  onChange: (values: any) => void;
  showAltitude?: boolean;
};

const CustomCoordinatesInput: React.FC<CustomCoordinatesInputProps> = ({
  label,
  values,
  onChange,
  showAltitude = false
}) => {
  return (
    <div className="space-y-3">
      <div className="w-full">
        <Label htmlFor={`${label}Name`}>Location Name (optional)</Label>
        <Input
          id={`${label}Name`}
          placeholder="Enter a name for this location"
          value={values.name}
          onChange={(e) => onChange({ ...values, name: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor={`${label}Lat`}>Latitude</Label>
          <Input
            id={`${label}Lat`}
            placeholder="Enter latitude"
            value={values.lat}
            onChange={(e) => onChange({ ...values, lat: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor={`${label}Lng`}>Longitude</Label>
          <Input
            id={`${label}Lng`}
            placeholder="Enter longitude"
            value={values.lng}
            onChange={(e) => onChange({ ...values, lng: e.target.value })}
          />
        </div>
        {showAltitude && (
          <div className="col-span-2">
            <Label htmlFor={`${label}Alt`}>Altitude (ft)</Label>
            <Input
              id={`${label}Alt`}
              placeholder="Enter altitude (optional)"
              value={values.altitude}
              onChange={(e) => onChange({ ...values, altitude: e.target.value })}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomCoordinatesInput;
