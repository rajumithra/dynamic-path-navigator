
// OSRM API service for route planning

export type Coordinates = {
  lat: number;
  lng: number;
  altitude?: number;
};

export type Route = {
  geometry: {
    coordinates: number[][];
    type?: string;
  };
  distance: number;
  duration: number;
  legs: any[];
  altitude?: number[];
};

export type RoutingResponse = {
  routes: Route[];
  waypoints: any[];
  code?: string;
  message?: string;
};

export async function getRoutes(
  source: Coordinates, 
  destination: Coordinates, 
  isFlightMode: boolean = false
): Promise<Route[]> {
  try {
    if (isFlightMode) {
      return getFlightRoutes(source, destination);
    }

    // Use https for secure connection
    const url = `https://router.project-osrm.org/route/v1/driving/${source.lng},${source.lat};${destination.lng},${destination.lat}?overview=full&alternatives=true&steps=true`;
    
    console.log('Fetching routes from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`);
    }
    
    const data: RoutingResponse = await response.json();
    
    // Check if the API returned an error
    if (data.code !== 'Ok') {
      throw new Error(`Routing error: ${data.message || 'Unknown error'}`);
    }
    
    // Check if we got valid routes
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No routes found between these locations');
    }
    
    // Ensure each route has the correct format for coordinates
    const validRoutes = data.routes.map(route => {
      // If the route's geometry is a string (encoded polyline), decode it
      if (typeof route.geometry === 'string') {
        const coordinates = decodePolyline(route.geometry);
        return {
          ...route,
          geometry: {
            coordinates: coordinates.map(coord => [coord[1], coord[0]]),
            type: 'LineString'
          }
        };
      }
      
      // If it's already in the right format, return as is
      return route;
    });
    
    console.log('Routes fetched successfully:', validRoutes.length);
    return validRoutes;
  } catch (error) {
    console.error('Error fetching routes:', error);
    throw error;
  }
}

// Generate flight routes with a direct path and variations
export async function getFlightRoutes(source: Coordinates, destination: Coordinates): Promise<Route[]> {
  // For flight routes, we'll create a direct path and some alternatives
  const sourceAlt = source.altitude || 3500;
  const destAlt = destination.altitude || 3500;
  
  // Calculate straight line distance
  const distance = calculateDistance(source, destination);
  
  // Calculate duration (assuming average flight speed of 800 km/h)
  const duration = (distance / 800) * 3600; // Convert to seconds
  
  // Create direct route
  const directRoute: Route = {
    geometry: {
      coordinates: createFlightPath(source, destination, 0),
      type: 'LineString'
    },
    distance: distance * 1000, // Convert to meters
    duration: duration,
    legs: [],
    altitude: [sourceAlt, destAlt]
  };
  
  // Create alternative routes with slight variations
  const alternativeRoutes: Route[] = [
    {
      geometry: {
        coordinates: createFlightPath(source, destination, 0.1),
        type: 'LineString'
      },
      distance: distance * 1000 * 1.05, // 5% longer
      duration: duration * 1.05,
      legs: [],
      altitude: [sourceAlt, destAlt]
    },
    {
      geometry: {
        coordinates: createFlightPath(source, destination, -0.1),
        type: 'LineString'
      },
      distance: distance * 1000 * 1.07, // 7% longer
      duration: duration * 1.07,
      legs: [],
      altitude: [sourceAlt, destAlt]
    }
  ];
  
  return [directRoute, ...alternativeRoutes];
}

// Create a flight path with some variance
function createFlightPath(source: Coordinates, destination: Coordinates, variance: number): number[][] {
  // For a simple flight path, we'll create a path with a midpoint
  const midPoint = {
    lng: (source.lng + destination.lng) / 2 + variance * (destination.lng - source.lng),
    lat: (source.lat + destination.lat) / 2 + variance * (destination.lat - source.lat)
  };
  
  // Create path with some intermediate points for smoother flight visualization
  const points: number[][] = [];
  
  // Add source
  points.push([source.lng, source.lat]);
  
  // Add some intermediate points
  const steps = 8;
  for (let i = 1; i < steps; i++) {
    const ratio = i / steps;
    
    // First half - from source to midpoint
    if (i < steps / 2) {
      const subRatio = i / (steps / 2);
      points.push([
        source.lng + (midPoint.lng - source.lng) * subRatio,
        source.lat + (midPoint.lat - source.lat) * subRatio
      ]);
    } 
    // Second half - from midpoint to destination
    else {
      const subRatio = (i - steps / 2) / (steps / 2);
      points.push([
        midPoint.lng + (destination.lng - midPoint.lng) * subRatio,
        midPoint.lat + (destination.lat - midPoint.lat) * subRatio
      ]);
    }
  }
  
  // Add destination
  points.push([destination.lng, destination.lat]);
  
  return points;
}

// Calculate haversine distance between two coordinates
function calculateDistance(source: Coordinates, destination: Coordinates): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(destination.lat - source.lat);
  const dLon = toRad(destination.lng - source.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(source.lat)) * Math.cos(toRad(destination.lat)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(value: number): number {
  return value * Math.PI / 180;
}

// Helper function to decode polyline
export function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  const len = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < len) {
    let b;
    let shift = 0;
    let result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

// Find alternative route if obstacle is detected
export function findAlternativeRoute(
  currentRoute: Route,
  alternativeRoutes: Route[],
  obstaclePosition: Coordinates
): Route | null {
  // If there are no alternatives, return null
  if (!alternativeRoutes || alternativeRoutes.length <= 1) {
    return null;
  }

  // Find the nearest alternative route
  // For simplicity, we're just selecting another route
  // In a real app, you would need to find the closest diversion point
  const otherRoutes = alternativeRoutes.filter(route => route !== currentRoute);
  
  // Sort by distance
  otherRoutes.sort((a, b) => a.distance - b.distance);
  
  // Return the shortest alternative route
  return otherRoutes[0];
}
