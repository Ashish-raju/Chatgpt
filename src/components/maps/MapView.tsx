import React, { useRef, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import MapView, { Marker, Region, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { Location, Ride } from '../../types';
import { colors } from '../../styles/colors';
import { MAPS_CONFIG } from '../../config/maps';

interface CustomMapViewProps {
  currentLocation?: Location | null;
  rides?: Ride[];
  selectedRide?: Ride | null;
  onRegionChange?: (region: Region) => void;
  onMarkerPress?: (ride: Ride) => void;
  style?: any;
  showUserLocation?: boolean;
  initialRegion?: Region;
}

const CustomMapView: React.FC<CustomMapViewProps> = ({
  currentLocation,
  rides = [],
  selectedRide,
  onRegionChange,
  onMarkerPress,
  style,
  showUserLocation = true,
  initialRegion,
}) => {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (currentLocation && mapRef.current) {
      const region: Region = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: MAPS_CONFIG.region.latitudeDelta,
        longitudeDelta: MAPS_CONFIG.region.longitudeDelta,
      };
      
      mapRef.current.animateToRegion(region, 1000);
    }
  }, [currentLocation]);

  const getInitialRegion = (): Region => {
    if (initialRegion) {
      return initialRegion;
    }
    
    if (currentLocation) {
      return {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: MAPS_CONFIG.region.latitudeDelta,
        longitudeDelta: MAPS_CONFIG.region.longitudeDelta,
      };
    }
    
    return MAPS_CONFIG.region;
  };

  const handleMarkerPress = (ride: Ride) => {
    if (onMarkerPress) {
      onMarkerPress(ride);
    }
  };

  const renderRideMarkers = () => {
    return rides.map((ride) => (
      <Marker
        key={ride.id}
        coordinate={{
          latitude: ride.startLocation.latitude,
          longitude: ride.startLocation.longitude,
        }}
        title={ride.riderProfile.name}
        description={ride.startLocation.address}
        onPress={() => handleMarkerPress(ride)}
        pinColor={selectedRide?.id === ride.id ? colors.primary : colors.mapPin}
      >
        <View style={[
          styles.markerContainer,
          selectedRide?.id === ride.id && styles.selectedMarker
        ]}>
          <Ionicons
            name="car"
            size={20}
            color={selectedRide?.id === ride.id ? colors.primary : colors.mapPin}
          />
        </View>
      </Marker>
    ));
  };

  const renderCurrentLocationMarker = () => {
    if (!currentLocation || !showUserLocation) return null;

    return (
      <Marker
        coordinate={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
        }}
        title="Your Location"
        description={currentLocation.address}
      >
        <View style={styles.currentLocationMarker}>
          <Ionicons name="person" size={16} color={colors.background} />
        </View>
      </Marker>
    );
  };

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={getInitialRegion()}
        onRegionChangeComplete={onRegionChange}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        rotateEnabled={true}
        scrollEnabled={true}
        zoomEnabled={true}
        pitchEnabled={true}
        toolbarEnabled={false}
        loadingEnabled={true}
        maxZoomLevel={MAPS_CONFIG.maxZoom}
        minZoomLevel={MAPS_CONFIG.minZoom}
      >
        {renderCurrentLocationMarker()}
        {renderRideMarkers()}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  markerContainer: {
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: colors.mapPin,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  selectedMarker: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  currentLocationMarker: {
    backgroundColor: colors.primary,
    borderRadius: 15,
    padding: 6,
    borderWidth: 3,
    borderColor: colors.background,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default CustomMapView;
