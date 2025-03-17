
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '@/context/NavigationContext';
import MapView from '@/components/MapView';
import Camera from '@/components/Camera';
import ObstacleAlert from '@/components/ObstacleAlert';
import { ArrowLeft, MapPin as MapPinIcon, Navigation as NavigationIcon } from 'lucide-react';
import MapPin from '@/components/MapPin';

const NavigationPage = () => {
  const navigate = useNavigate();
  const { source, destination, currentRoute, setObstacleDetected } = useNavigation();
  const [showObstacleAlert, setShowObstacleAlert] = useState(false);

  // Redirect to home if source or destination not set
  useEffect(() => {
    if (!source || !destination) {
      navigate('/');
    }
  }, [source, destination, navigate]);

  const handleObstacleDetected = () => {
    setObstacleDetected(true);
    setShowObstacleAlert(true);
  };

  const handleAlertClose = () => {
    setShowObstacleAlert(false);
    setObstacleDetected(false);
  };

  if (!source || !destination) {
    return null; // This will redirect in the useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <Button variant="outline" size="sm" onClick={() => navigate('/')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Dynamic Path Navigator</h1>
        <div className="w-20"></div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <NavigationIcon className="h-5 w-5 text-nav" /> Navigation Map
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MapView />
              
              {currentRoute && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium">Distance</p>
                      <p>{(currentRoute.distance / 1000).toFixed(1)} km</p>
                    </div>
                    <div>
                      <p className="font-medium">Estimated Time</p>
                      <p>{Math.round(currentRoute.duration / 60)} min</p>
                    </div>
                    <div>
                      <p className="font-medium">Status</p>
                      <p className="text-nav-secondary">Active</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Obstacle Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <Camera onObstacleDetected={handleObstacleDetected} />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Navigation Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin type="source" />
                  <div>
                    <p className="text-sm text-gray-500">Starting Point</p>
                    <p className="font-medium">Current Location</p>
                  </div>
                </div>
                
                <div className="border-l-2 border-dashed border-gray-300 h-12 ml-4"></div>
                
                <div className="flex items-center gap-3">
                  <MapPin type="destination" />
                  <div>
                    <p className="text-sm text-gray-500">Destination</p>
                    <p className="font-medium">Target Location</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-nav font-medium mb-1">Navigation in Progress</p>
                  <p className="text-sm text-gray-600">
                    The system is actively monitoring for obstacles and will automatically adjust the route if needed.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Obstacle Alert Dialog */}
      <ObstacleAlert open={showObstacleAlert} onClose={handleAlertClose} />
    </div>
  );
};

export default NavigationPage;
