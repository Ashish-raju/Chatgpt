import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { LocationState, Location as AppLocation, Ride } from '../types';
import { DEMO_MODE, DEMO_RIDES } from '../config/demo';

interface LocationContextType extends LocationState {
  requestLocationPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<AppLocation | null>;
  searchNearbyRides: (radius?: number) => Promise<void>;
  updateSearchRadius: (radius: number) => void;
  searchRadius: number;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

interface LocationProviderProps {
  children: ReactNode;
}

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [locationState, setLocationState] = useState<LocationState>({
    currentLocation: null,
    isLoading: false,
    hasPermission: false,
    nearbyRides: [],
  });

  const [searchRadius, setSearchRadius] = useState(SEARCH_RADIUS.default);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      const hasPermission = status === 'granted';
      
      setLocationState(prev => ({
        ...prev,
        hasPermission,
      }));

      if (hasPermission) {
        await getCurrentLocation();
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      setLocationState(prev => ({
        ...prev,
        hasPermission: false,
      }));
    }
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      const hasPermission = status === 'granted';
      
      setLocationState(prev => ({
        ...prev,
        hasPermission,
      }));

      if (hasPermission) {
        await getCurrentLocation();
      }

      return hasPermission;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  };

  const getCurrentLocation = async (): Promise<AppLocation | null> => {
    if (!locationState.hasPermission) {
      return null;
    }

    try {
      setLocationState(prev => ({ ...prev, isLoading: true }));

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const currentLocation: AppLocation = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      // Get address from coordinates
      try {
        const geocoded = await Location.reverseGeocodeAsync({
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        });

        if (geocoded.length > 0) {
          const result = geocoded[0];
          currentLocation.address = `${result.street || ''} ${result.city || ''} ${result.region || ''}`.trim();
          currentLocation.name = result.name || undefined;
        }
      } catch (geocodeError) {
        console.warn('Geocoding failed:', geocodeError);
      }

      setLocationState(prev => ({
        ...prev,
        currentLocation,
        isLoading: false,
      }));

      return currentLocation;
    } catch (error) {
      console.error('Error getting current location:', error);
      setLocationState(prev => ({
        ...prev,
        isLoading: false,
      }));
      return null;
    }
  };

  const searchNearbyRides = async (radius?: number): Promise<void> => {
    const searchRadiusToUse = radius || searchRadius;
    
    if (!locationState.currentLocation) {
      await getCurrentLocation();
      if (!locationState.currentLocation) {
        return;
      }
    }

    try {
      setLocationState(prev => ({ ...prev, isLoading: true }));

      const nearbyRides = await rideService.getNearbyRides(
        locationState.currentLocation!,
        searchRadiusToUse
      );

      setLocationState(prev => ({
        ...prev,
        nearbyRides,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error searching nearby rides:', error);
      setLocationState(prev => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  const updateSearchRadius = (radius: number) => {
    setSearchRadius(radius);
    if (locationState.currentLocation) {
      searchNearbyRides(radius);
    }
  };

  const value: LocationContextType = {
    ...locationState,
    requestLocationPermission,
    getCurrentLocation,
    searchNearbyRides,
    updateSearchRadius,
    searchRadius,
  };

  return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};
