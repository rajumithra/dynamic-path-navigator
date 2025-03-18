import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useNavigation } from '@/context/NavigationContext';
import MapView from '@/components/MapView';
import Camera from '@/components/Camera';
import ObstacleAlert from '@/components/ObstacleAlert';
import { ArrowLeft, MapPin as MapPinIcon, Navigation as NavigationIcon, AlertTriangle, Plane } from 'lucide-react';
import MapPin from '@/components/MapPin';

const NavigationPage = () => {
  const navigate = useNavigate();
  const { source, destination, currentRoute, setObstacleDetected, obstacleDetected, routeType } = useNavigation();
  const [showObstacleAlert, setShowObstacleAlert] = useState(false);
  const [routeStatus, setRouteStatus] = useState('active');

  // Redirect to home if source or destination not set
  useEffect(() => {
    if (!source || !destination) {
      navigate('/');
    }
  }, [source, destination, navigate]);

  const handleObstacleDetected = () => {
    setObstacleDetected(true);
    setShowObstacleAlert(true);
    setRouteStatus('rerouting');
  };

  const handleAlertClose = () => {
    setShowObstacleAlert(false);
    setObstacleDetected(false);
    setRouteStatus('active');
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
        <h1 className="text-2xl font-bold">
          {routeType === 'flight' ? 'Flight Path Navigator ✈️' : 'Dynamic Path Navigator'}
        </h1>
        <div className="w-20"></div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                {routeType === 'flight' ? (
                  <Plane className="h-5 w-5 text-nav" />
                ) : (
                  <NavigationIcon className="h-5 w-5 text-nav" />
                )}
                {routeType === 'flight' ? 'Flight Map' : 'Navigation Map'}
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
                      <p className="font-medium">
                        {routeType === 'flight' ? 'Flight Time' : 'Estimated Time'}
                      </p>
                      <p>{Math.round(currentRoute.duration / 60)} min</p>
                    </div>
                    <div>
                      <p className="font-medium">Status</p>
                      <p className={`${routeStatus === 'active' ? 'text-nav-secondary' : 'text-orange-500'} font-medium`}>
                        {routeStatus === 'active' ? 'Active' : 'Rerouting'}
                      </p>
                    </div>
                  </div>
                  {routeType === 'flight' && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Altitude</p>
                          <p>{source.coordinates.altitude || 3500} - {destination.coordinates.altitude || 3500} ft</p>
                        </div>
                        <div>
                          <p className="font-medium">Route Type</p>
                          <p>Direct Flight Path</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {routeType === 'flight' ? 'Airspace Monitoring' : 'Obstacle Detection'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Camera onObstacleDetected={handleObstacleDetected} />
              
              {obstacleDetected && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg flex items-center">
                  <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
                  <p className="text-sm text-orange-700">
                    {routeType === 'flight' 
                      ? 'Airspace obstacle detected! Adjusting flight path...' 
                      : 'Obstacle detected! Rerouting...'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">
                {routeType === 'flight' ? 'Flight Instructions' : 'Navigation Instructions'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin type="source" />
                  <div>
                    <p className="text-sm text-gray-500">
                      {routeType === 'flight' ? 'Departure' : 'Starting Point'}
                    </p>
                    <p className="font-medium">
                      {routeType === 'flight' && source?.coordinates.altitude 
                        ? `${source.coordinates.altitude} ft Altitude` 
                        : 'Current Location'}
                    </p>
                  </div>
                </div>
                
                <div className="border-l-2 border-dashed border-gray-300 h-12 ml-4"></div>
                
                <div className="flex items-center gap-3">
                  <MapPin type="destination" />
                  <div>
                    <p className="text-sm text-gray-500">
                      {routeType === 'flight' ? 'Arrival' : 'Destination'}
                    </p>
                    <p className="font-medium">
                      {routeType === 'flight' && destination?.coordinates.altitude 
                        ? `${destination.coordinates.altitude} ft Altitude` 
                        : 'Target Location'}
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <p className="text-nav font-medium mb-1">
                    {routeType === 'flight' ? 'Flight in Progress' : 'Navigation in Progress'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {routeType === 'flight'
                      ? 'The system is actively monitoring airspace for obstacles and will automatically adjust the flight path if needed.'
                      : 'The system is actively monitoring for obstacles and will automatically adjust the route if needed.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Obstacle Alert Dialog */}
      <ObstacleAlert 
        open={showObstacleAlert} 
        onClose={handleAlertClose} 
        isFlightMode={routeType === 'flight'} 
      />
    </div>
  );
};

export default NavigationPage;
