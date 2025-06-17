import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { useLocation } from '../../contexts/LocationContext';
import { rideService } from '../../services/rideService';
import CustomButton from '../../components/common/CustomButton';
import CustomInput from '../../components/common/CustomInput';
import CustomMapView from '../../components/maps/MapView';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Location } from '../../types';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

type CreateRideScreenNavigationProp = StackNavigationProp<
  MainStackParamList,
  'CreateRide'
>;

interface Props {
  navigation: CreateRideScreenNavigationProp;
}

const CreateRideScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const { currentLocation, getCurrentLocation } = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [startLocation, setStartLocation] = useState<Location | null>(null);
  const [endLocation, setEndLocation] = useState<Location | null>(null);
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  const [isSelectingLocation, setIsSelectingLocation] = useState<'start' | 'end' | null>(null);

  useEffect(() => {
    initializeLocation();
  }, []);

  const initializeLocation = async () => {
    try {
      const location = await getCurrentLocation();
      if (location) {
        setStartLocation(location);
        setStartAddress(location.address || '');
      }
    } catch (error) {
      console.warn('Failed to get current location:', error);
    }
  };

  const handleLocationSelect = () => {
    if (!isSelectingLocation) return;

    if (isSelectingLocation === 'start' && currentLocation) {
      setStartLocation(currentLocation);
      setStartAddress(currentLocation.address || '');
    } else if (isSelectingLocation === 'end' && currentLocation) {
      setEndLocation(currentLocation);
      setEndAddress(currentLocation.address || '');
    }

    setIsSelectingLocation(null);
  };

  const handleUseCurrentLocation = async (type: 'start' | 'end') => {
    try {
      const location = await getCurrentLocation();
      if (location) {
        if (type === 'start') {
          setStartLocation(location);
          setStartAddress(location.address || '');
        } else {
          setEndLocation(location);
          setEndAddress(location.address || '');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to get current location');
    }
  };

  const handleCreateRide = async () => {
    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    if (!startLocation) {
      Alert.alert('Validation Error', 'Please select a pickup location');
      return;
    }

    setIsLoading(true);
    try {
      await rideService.createRide(user.id, startLocation, endLocation || undefined);
      Alert.alert(
        'Ride Created',
        'Your ride has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create ride');
    } finally {
      setIsLoading(false);
    }
  };

  const renderLocationInput = (
    type: 'start' | 'end',
    label: string,
    address: string,
    setAddress: (address: string) => void,
    required: boolean = false
  ) => (
    <View style={styles.locationInputContainer}>
      <CustomInput
        label={label}
        value={address}
        onChangeText={setAddress}
        placeholder={`Enter ${label.toLowerCase()}`}
        required={required}
        rightIcon="location-outline"
        onRightIconPress={() => handleUseCurrentLocation(type)}
      />
      <TouchableOpacity
        style={styles.selectLocationButton}
        onPress={() => setIsSelectingLocation(type)}
      >
        <Ionicons name="map-outline" size={20} color={colors.primary} />
        <Text style={styles.selectLocationText}>Select on Map</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Create New Ride</Text>
              <Text style={styles.subtitle}>
                Set your pickup and destination to find seekers
              </Text>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Ride Details</Text>
              
              {renderLocationInput(
                'start',
                'Pickup Location',
                startAddress,
                setStartAddress,
                true
              )}

              {renderLocationInput(
                'end',
                'Destination (Optional)',
                endAddress,
                setEndAddress
              )}
            </View>

            {isSelectingLocation && (
              <View style={styles.mapSection}>
                <Text style={styles.sectionTitle}>
                  {isSelectingLocation === 'start' ? 'Select Pickup Location' : 'Select Destination'}
                </Text>
                <View style={styles.mapContainer}>
                  <CustomMapView
                    currentLocation={currentLocation}
                    showUserLocation={true}
                    style={styles.map}
                  />
                  <View style={styles.mapOverlay}>
                    <Ionicons name="location" size={32} color={colors.error} />
                  </View>
                </View>
                <View style={styles.mapActions}>
                  <CustomButton
                    title="Cancel"
                    onPress={() => setIsSelectingLocation(null)}
                    variant="outline"
                    style={styles.mapActionButton}
                  />
                  <CustomButton
                    title="Confirm Location"
                    onPress={handleLocationSelect}
                    style={styles.mapActionButton}
                  />
                </View>
              </View>
            )}

            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <Ionicons name="information-circle-outline" size={20} color={colors.info} />
                <Text style={styles.infoText}>
                  Seekers will be able to see your pickup location and express interest in your ride.
                </Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="shield-checkmark-outline" size={20} color={colors.success} />
                <Text style={styles.infoText}>
                  Your identity has been verified for rider safety.
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <CustomButton
            title="Create Ride"
            onPress={handleCreateRide}
            disabled={!startLocation}
            style={styles.createButton}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.large,
  },
  header: {
    marginBottom: spacing.extraLarge,
  },
  title: {
    ...typography.heading2,
    color: colors.text,
    marginBottom: spacing.small,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  formSection: {
    marginBottom: spacing.extraLarge,
  },
  sectionTitle: {
    ...typography.heading4,
    color: colors.text,
    marginBottom: spacing.medium,
  },
  locationInputContainer: {
    marginBottom: spacing.medium,
  },
  selectLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.small,
    marginTop: spacing.tiny,
  },
  selectLocationText: {
    ...typography.caption,
    color: colors.primary,
    marginLeft: spacing.small,
  },
  mapSection: {
    marginBottom: spacing.extraLarge,
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -16 }, { translateY: -32 }],
    zIndex: 10,
  },
  mapActions: {
    flexDirection: 'row',
    gap: spacing.medium,
    marginTop: spacing.medium,
  },
  mapActionButton: {
    flex: 1,
  },
  infoSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.medium,
    marginBottom: spacing.extraLarge,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.medium,
  },
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    marginLeft: spacing.small,
    lineHeight: 18,
  },
  footer: {
    padding: spacing.large,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  createButton: {
    marginBottom: spacing.small,
  },
});

export default CreateRideScreen;
