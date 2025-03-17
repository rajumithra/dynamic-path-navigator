
import React from 'react';
import LocationForm from '@/components/LocationForm';
import { Card, CardContent } from '@/components/ui/card';
import { Navigation, MapPin, Camera, AlertTriangle } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Dynamic Path Navigator
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real-time navigation with obstacle detection and path optimization
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <LocationForm />
          </div>

          <div className="space-y-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-nav/10 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-nav" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Smart Location Selection</h3>
                    <p className="text-gray-600">Choose from predefined locations or add your own custom destinations</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-nav-secondary/10 p-3 rounded-full">
                    <Camera className="h-6 w-6 text-nav-secondary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Real-time Obstacle Detection</h3>
                    <p className="text-gray-600">Advanced computer vision identifies obstacles in your path</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-nav-accent/10 p-3 rounded-full">
                    <Navigation className="h-6 w-6 text-nav-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Dynamic Path Adjustment</h3>
                    <p className="text-gray-600">Automatically reroutes when obstacles are detected</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-amber-500/10 p-3 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Intelligent Alerts</h3>
                    <p className="text-gray-600">Get notifications about obstacles and route changes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-center text-gray-500 text-sm mt-16">
          <p>Powered by OSRM and TensorFlow.js</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
