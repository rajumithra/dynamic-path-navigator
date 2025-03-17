
// OSRM API service for route planning

export type Coordinates = {
  lat: number;
  lng: number;
};

export type Route = {
  geometry: {
    coordinates: number[][];
  };
  distance: number;
  duration: number;
  legs: any[];
};

export type RoutingResponse = {
  routes: Route[];
  waypoints: any[];
};

export async function getRoutes(source: Coordinates, destination: Coordinates): Promise<Route[]> {
  try {
    // Changed from http to https for secure connection
    const url = `https://router.project-osrm.org/route/v1/driving/${source.lng},${source.lat};${destination.lng},${destination.lat}?overview=full&alternatives=true&steps=true`;
    
    console.log('Fetching routes from:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`OSRM API error: ${response.status}`);
    }
    
    const data: RoutingResponse = await response.json();
    
    // Check if we got valid routes
    if (!data.routes || data.routes.length === 0) {
      throw new Error('No routes found between these locations');
    }
    
    console.log('Routes fetched successfully:', data.routes.length);
    return data.routes;
  } catch (error) {
    console.error('Error fetching routes:', error);
    throw error;
  }
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
