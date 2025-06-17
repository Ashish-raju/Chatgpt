import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  Dimensions,
} from 'react-native';
import { Ride, SwipeAction } from '../../types';
import SwipeCard from './SwipeCard';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

interface SwipeContainerProps {
  rides: Ride[];
  onSwipeLeft: (ride: Ride) => void;
  onSwipeRight: (ride: Ride) => void;
  loading?: boolean;
  error?: string;
}

const { height: screenHeight } = Dimensions.get('window');

const SwipeContainer: React.FC<SwipeContainerProps> = ({
  rides,
  onSwipeLeft,
  onSwipeRight,
  loading = false,
  error,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleRides, setVisibleRides] = useState<Ride[]>([]);

  useEffect(() => {
    if (rides.length > 0) {
      // Show current and next card for smooth transitions
      const visible = rides.slice(currentIndex, currentIndex + 2);
      setVisibleRides(visible);
    }
  }, [rides, currentIndex]);

  const handleSwipeLeft = (ride: Ride) => {
    onSwipeLeft(ride);
    moveToNextCard();
  };

  const handleSwipeRight = (ride: Ride) => {
    onSwipeRight(ride);
    moveToNextCard();
  };

  const moveToNextCard = () => {
    setCurrentIndex(prev => prev + 1);
  };

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Loading rides...</Text>
          <Text style={styles.emptySubtitle}>Finding riders near you</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Unable to load rides</Text>
          <Text style={styles.emptySubtitle}>{error}</Text>
        </View>
      );
    }

    if (currentIndex >= rides.length) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No more rides</Text>
          <Text style={styles.emptySubtitle}>
            Check back later for new ride opportunities
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No rides available</Text>
        <Text style={styles.emptySubtitle}>
          There are no rides in your area right now
        </Text>
      </View>
    );
  };

  if (visibleRides.length === 0) {
    return renderEmptyState();
  }

  return (
    <View style={styles.container}>
      {visibleRides.map((ride, index) => (
        <SwipeCard
          key={`${ride.id}-${currentIndex + index}`}
          ride={ride}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
          style={{
            zIndex: visibleRides.length - index,
            transform: [
              { scale: 1 - (index * 0.05) },
              { translateY: index * 10 },
            ],
          }}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginBottom: spacing.small,
  },
  emptySubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default SwipeContainer;
