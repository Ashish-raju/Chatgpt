import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
  State,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Ride } from '../../types';
import ProfileCard from '../profile/ProfileCard';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

interface SwipeCardProps {
  ride: Ride;
  onSwipeLeft: (ride: Ride) => void;
  onSwipeRight: (ride: Ride) => void;
  style?: any;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const SWIPE_THRESHOLD = screenWidth * 0.25;
const ROTATION_ANGLE = 15;

const SwipeCard: React.FC<SwipeCardProps> = ({
  ride,
  onSwipeLeft,
  onSwipeRight,
  style,
}) => {
  const translateX = new Animated.Value(0);
  const translateY = new Animated.Value(0);
  const rotate = new Animated.Value(0);
  const opacity = new Animated.Value(1);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.END) {
      const { translationX, velocityX } = event.nativeEvent;
      
      const swipeDirection = Math.sign(translationX);
      const isSwipeSignificant = Math.abs(translationX) > SWIPE_THRESHOLD || Math.abs(velocityX) > 500;

      if (isSwipeSignificant) {
        // Animate card off screen
        const toValue = swipeDirection * screenWidth * 1.5;
        
        Animated.parallel([
          Animated.timing(translateX, {
            toValue,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Call appropriate callback
          if (swipeDirection > 0) {
            onSwipeRight(ride);
          } else {
            onSwipeLeft(ride);
          }
        });
      } else {
        // Animate card back to center
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }),
          Animated.spring(rotate, {
            toValue: 0,
            useNativeDriver: true,
          }),
        ]).start();
      }
    } else if (event.nativeEvent.state === State.ACTIVE) {
      // Update rotation based on horizontal translation
      const rotationValue = (event.nativeEvent.translationX / screenWidth) * ROTATION_ANGLE;
      rotate.setValue(rotationValue);
    }
  };

  const rotateInterpolate = rotate.interpolate({
    inputRange: [-ROTATION_ANGLE, ROTATION_ANGLE],
    outputRange: ['-15deg', '15deg'],
    extrapolate: 'clamp',
  });

  const likeOpacity = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const passOpacity = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const calculateDistance = () => {
    if (!ride.endLocation) return 'Distance not specified';
    
    // Simple distance calculation (should use proper geolocation library in production)
    const startLat = ride.startLocation.latitude;
    const startLng = ride.startLocation.longitude;
    const endLat = ride.endLocation.latitude;
    const endLng = ride.endLocation.longitude;
    
    const R = 6371; // Earth's radius in km
    const dLat = (endLat - startLat) * Math.PI / 180;
    const dLng = (endLng - startLng) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(startLat * Math.PI / 180) * Math.cos(endLat * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return `${distance.toFixed(1)} km`;
  };

  return (
    <PanGestureHandler
      onGestureEvent={onGestureEvent}
      onHandlerStateChange={onHandlerStateChange}
    >
      <Animated.View
        style={[
          styles.container,
          style,
          {
            transform: [
              { translateX },
              { translateY },
              { rotate: rotateInterpolate },
            ],
            opacity,
          },
        ]}
      >
        <View style={styles.card}>
          {/* Swipe indicators */}
          <Animated.View style={[styles.swipeIndicator, styles.likeIndicator, { opacity: likeOpacity }]}>
            <Ionicons name="heart" size={64} color={colors.swipeLike} />
            <Text style={[styles.swipeText, { color: colors.swipeLike }]}>LIKE</Text>
          </Animated.View>

          <Animated.View style={[styles.swipeIndicator, styles.passIndicator, { opacity: passOpacity }]}>
            <Ionicons name="close" size={64} color={colors.swipePass} />
            <Text style={[styles.swipeText, { color: colors.swipePass }]}>PASS</Text>
          </Animated.View>

          {/* Profile card */}
          <ProfileCard profile={ride.riderProfile} showFullInfo={false} />

          {/* Ride information */}
          <View style={styles.rideInfo}>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color={colors.primary} />
              <Text style={styles.locationText} numberOfLines={1}>
                {ride.startLocation.address || 'Pickup location'}
              </Text>
            </View>

            {ride.endLocation && (
              <View style={styles.locationRow}>
                <Ionicons name="flag" size={16} color={colors.secondary} />
                <Text style={styles.locationText} numberOfLines={1}>
                  {ride.endLocation.address || 'Destination'}
                </Text>
              </View>
            )}

            <View style={styles.rideDetails}>
              <View style={styles.detailItem}>
                <Ionicons name="time" size={16} color={colors.textSecondary} />
                <Text style={styles.detailText}>
                  {new Date(ride.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>

              <View style={styles.detailItem}>
                <Ionicons name="speedometer" size={16} color={colors.textSecondary} />
                <Text style={styles.detailText}>{calculateDistance()}</Text>
              </View>
            </View>
          </View>
        </View>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: screenWidth,
    height: screenHeight * 0.8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: screenWidth - (spacing.large * 2),
    backgroundColor: colors.swipeBackground,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  swipeIndicator: {
    position: 'absolute',
    top: 50,
    zIndex: 10,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: spacing.large,
    paddingVertical: spacing.medium,
    borderRadius: 12,
  },
  likeIndicator: {
    right: spacing.large,
    borderWidth: 3,
    borderColor: colors.swipeLike,
  },
  passIndicator: {
    left: spacing.large,
    borderWidth: 3,
    borderColor: colors.swipePass,
  },
  swipeText: {
    ...typography.heading4,
    fontWeight: 'bold',
    marginTop: spacing.small,
  },
  rideInfo: {
    padding: spacing.large,
    backgroundColor: colors.background,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  locationText: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.small,
    flex: 1,
  },
  rideDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.medium,
    paddingTop: spacing.medium,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.tiny,
  },
});

export default SwipeCard;
