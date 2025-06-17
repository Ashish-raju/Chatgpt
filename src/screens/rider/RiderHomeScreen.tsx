import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainStackParamList } from '../../navigation/MainNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { rideService } from '../../services/rideService';
import { matchService } from '../../services/matchService';
import RideCard from '../../components/ride/RideCard';
import CustomButton from '../../components/common/CustomButton';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorMessage from '../../components/common/ErrorMessage';
import { Ride } from '../../types';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

type RiderHomeScreenNavigationProp = StackNavigationProp<MainStackParamList>;

interface Props {
  navigation: RiderHomeScreenNavigationProp;
}

const RiderHomeScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [rides, setRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadRides();
    }
  }, [user]);

  const loadRides = async () => {
    if (!user) return;

    try {
      setError(null);
      const userRides = await rideService.getRidesByRiderId(user.id);
      setRides(userRides);
    } catch (error: any) {
      setError(error.message || 'Failed to load rides');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadRides();
    setIsRefreshing(false);
  };

  const handleCreateRide = () => {
    if (!user) return;

    if (user.kycStatus !== 'verified') {
      Alert.alert(
        'Verification Required',
        'You must complete identity verification before offering rides.',
        [{ text: 'OK' }]
      );
      return;
    }

    navigation.navigate('CreateRide');
  };

  const handleRidePress = (ride: Ride) => {
    navigation.navigate('RideManagement', { rideId: ride.id });
  };

  const handleCancelRide = async (rideId: string) => {
    Alert.alert(
      'Cancel Ride',
      'Are you sure you want to cancel this ride?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: async () => {
            try {
              await rideService.cancelRide(rideId, user!.id);
              await loadRides();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to cancel ride');
            }
          },
        },
      ]
    );
  };

  const renderRideItem = ({ item: ride }: { item: Ride }) => (
    <View style={styles.rideItemContainer}>
      <RideCard
        ride={ride}
        onPress={handleRidePress}
        showStatus={true}
      />
      {ride.status === 'available' && (
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => handleCancelRide(ride.id)}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="car-outline" size={64} color={colors.textSecondary} />
      <Text style={styles.emptyTitle}>No rides yet</Text>
      <Text style={styles.emptySubtitle}>
        Create your first ride to start connecting with seekers
      </Text>
      <CustomButton
        title="Create Ride"
        onPress={handleCreateRide}
        style={styles.emptyButton}
      />
    </View>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Hello, {user?.profile.name}!</Text>
        <Text style={styles.subtitle}>
          {user?.kycStatus === 'verified' 
            ? 'Ready to offer rides' 
            : 'Complete verification to start'
          }
        </Text>
      </View>
      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateRide}
        disabled={user?.kycStatus !== 'verified'}
      >
        <Ionicons name="add" size={24} color={colors.background} />
      </TouchableOpacity>
    </View>
  );

  const getActiveRidesCount = () => {
    return rides.filter(ride => 
      ride.status === 'available' || 
      ride.status === 'matched' || 
      ride.status === 'in_progress'
    ).length;
  };

  const renderStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{rides.length}</Text>
        <Text style={styles.statLabel}>Total Rides</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{getActiveRidesCount()}</Text>
        <Text style={styles.statLabel}>Active</Text>
      </View>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>
          {rides.filter(r => r.status === 'completed').length}
        </Text>
        <Text style={styles.statLabel}>Completed</Text>
      </View>
    </View>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <ErrorMessage
        message={error}
        onRetry={loadRides}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={rides}
        renderItem={renderRideItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={
          <>
            {renderHeader()}
            {renderStats()}
            {rides.length > 0 && (
              <Text style={styles.sectionTitle}>Your Rides</Text>
            )}
          </>
        }
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    padding: spacing.large,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.large,
  },
  greeting: {
    ...typography.heading2,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.tiny,
  },
  createButton: {
    backgroundColor: colors.primary,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.medium,
    marginBottom: spacing.large,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    ...typography.heading3,
    color: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.tiny,
  },
  sectionTitle: {
    ...typography.heading4,
    color: colors.text,
    marginBottom: spacing.medium,
  },
  rideItemContainer: {
    marginBottom: spacing.medium,
  },
  cancelButton: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: 8,
    alignSelf: 'flex-end',
    marginTop: spacing.small,
  },
  cancelButtonText: {
    ...typography.caption,
    color: colors.background,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.large,
  },
  emptyTitle: {
    ...typography.heading3,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.medium,
    marginBottom: spacing.small,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.large,
  },
  emptyButton: {
    maxWidth: 200,
  },
});

export default RiderHomeScreen;
