export const MAPS_CONFIG = {
  apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "default_maps_key",
  provider: 'google' as const,
  region: {
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  defaultZoom: 15,
  maxZoom: 18,
  minZoom: 10,
};

export const LOCATION_CONFIG = {
  accuracy: 6, // LocationAccuracy.Balanced
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000,
};

export const SEARCH_RADIUS = {
  default: 5000, // 5km in meters
  min: 1000, // 1km
  max: 50000, // 50km
};
