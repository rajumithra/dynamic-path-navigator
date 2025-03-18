
import React from 'react';
import { Navigation, Plane } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type TransportTypeSelectorProps = {
  value: string;
  onChange: (value: string) => void;
};

const TransportTypeSelector: React.FC<TransportTypeSelectorProps> = ({
  value,
  onChange
}) => {
  return (
    <Tabs defaultValue={value} onValueChange={onChange} className="mb-6">
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
  );
};

export default TransportTypeSelector;
