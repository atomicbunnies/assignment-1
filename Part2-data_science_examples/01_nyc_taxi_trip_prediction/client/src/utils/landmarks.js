// Preset NYC Landmark Coordinates and Geometries

export const PRESET_LANDMARKS = [
  { id: 'times_square', name: 'Times Square', lat: 40.7580, lon: -73.9855, zone: 'Midtown', icon: 'Sparkles' },
  { id: 'jfk_airport', name: 'JFK Airport', lat: 40.6413, lon: -73.7781, zone: 'Queens', icon: 'Plane' },
  { id: 'lga_airport', name: 'LaGuardia (LGA)', lat: 40.7769, lon: -73.8740, zone: 'Queens', icon: 'PlaneTakeoff' },
  { id: 'central_park', name: 'Central Park', lat: 40.7660, lon: -73.9772, zone: 'Uptown', icon: 'Trees' },
  { id: 'wall_street', name: 'Wall Street', lat: 40.7074, lon: -74.0113, zone: 'Downtown', icon: 'Building2' },
  { id: 'brooklyn_bridge', name: 'Brooklyn Bridge', lat: 40.7061, lon: -73.9969, zone: 'Brooklyn', icon: 'Anchor' },
  { id: 'empire_state', name: 'Empire State', lat: 40.7484, lon: -73.9857, zone: 'Midtown', icon: 'Landmark' },
  { id: 'grand_central', name: 'Grand Central', lat: 40.7527, lon: -73.9772, zone: 'Midtown', icon: 'Train' },
  { id: 'williamsburg', name: 'Williamsburg', lat: 40.7145, lon: -73.9587, zone: 'Brooklyn', icon: 'Coffee' },
  { id: 'astoria', name: 'Astoria', lat: 40.7644, lon: -73.9235, zone: 'Queens', icon: 'Compass' }
];

// Coordinate Normalization Helper for SVG Canvas Map
// Bounding box for NYC: Lat 40.58 to 40.86, Lon -74.12 to -73.74
export function projectGeoToSvg(lat, lon, width = 600, height = 480) {
  const minLat = 40.58, maxLat = 40.86;
  const minLon = -74.12, maxLon = -73.74;

  const x = ((lon - minLon) / (maxLon - minLon)) * width;
  const y = height - ((lat - minLat) / (maxLat - minLat)) * height;
  return { x: Math.max(10, Math.min(width - 10, x)), y: Math.max(10, Math.min(height - 10, y)) };
}
