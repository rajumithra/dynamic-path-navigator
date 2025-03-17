
import React from 'react';
import { MapPin as MapPinIcon, Navigation } from 'lucide-react';

type MapPinProps = {
  type: 'source' | 'destination';
};

const MapPin: React.FC<MapPinProps> = ({ type }) => {
  return (
    <div className="flex items-center gap-3">
      <div className={`${type === 'source' ? 'bg-nav/10' : 'bg-nav-secondary/10'} h-8 w-8 rounded-full flex items-center justify-center`}>
        {type === 'source' ? (
          <MapPinIcon className="h-4 w-4 text-nav" />
        ) : (
          <Navigation className="h-4 w-4 text-nav-secondary" />
        )}
      </div>
    </div>
  );
};

export default MapPin;
