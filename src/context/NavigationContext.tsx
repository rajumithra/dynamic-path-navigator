
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Coordinates = {
  lat: number;
  lng: number;
  altitude?: number;
};

type Location = {
  name: string;
  coordinates: Coordinates;
};

type RouteType = 'ground' | 'flight';

type NavigationContextType = {
  source: Location | null;
  destination: Location | null;
  alternativeRoutes: any[] | null;
  currentRoute: any | null;
  obstacleDetected: boolean;
  routeType: RouteType;
  setSource: (location: Location | null) => void;
  setDestination: (location: Location | null) => void;
  setAlternativeRoutes: (routes: any[] | null) => void;
  setCurrentRoute: (route: any | null) => void;
  setObstacleDetected: (detected: boolean) => void;
  setRouteType: (type: RouteType) => void;
};

const defaultContext: NavigationContextType = {
  source: null,
  destination: null,
  alternativeRoutes: null,
  currentRoute: null,
  obstacleDetected: false,
  routeType: 'ground',
  setSource: () => {},
  setDestination: () => {},
  setAlternativeRoutes: () => {},
  setCurrentRoute: () => {},
  setObstacleDetected: () => {},
  setRouteType: () => {},
};

const NavigationContext = createContext<NavigationContextType>(defaultContext);

export const useNavigation = () => useContext(NavigationContext);

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [source, setSource] = useState<Location | null>(null);
  const [destination, setDestination] = useState<Location | null>(null);
  const [alternativeRoutes, setAlternativeRoutes] = useState<any[] | null>(null);
  const [currentRoute, setCurrentRoute] = useState<any | null>(null);
  const [obstacleDetected, setObstacleDetected] = useState<boolean>(false);
  const [routeType, setRouteType] = useState<RouteType>('ground');

  return (
    <NavigationContext.Provider
      value={{
        source,
        destination,
        alternativeRoutes,
        currentRoute,
        obstacleDetected,
        routeType,
        setSource,
        setDestination,
        setAlternativeRoutes,
        setCurrentRoute,
        setObstacleDetected,
        setRouteType,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};
