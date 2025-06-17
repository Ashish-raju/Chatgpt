import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Ride } from '../../types';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

interface RideCardProps {
  ride: Ride;
  onPress?: (ride: Ride) => void;
  showStatus?: boolean;
  variant?: 'default' | 'compact';
  style?: any;
}

const RideCard: React.FC<RideCardProps> = ({
  ride,
  onPress,
  showStatus = true,
  variant = 'default',
  style,
}) => {
  const getStatusColor = (status: Ride['status']) => {
    switch (status) {
      case 'available':
        return colors.success;
      case 'matched':
        return colors.info;
      case 'in_progress':
        return colors.warning;
      case 'completed':
        return colors.textSecondary;
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getStatusText = (status: Ride['status']) => {
    switch (status) {
      case 'available':
        return 'Available';
      case 'matched':
        return 'Matched';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    
    if (isToday) {
      return formatTime(date);
    }
    
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderProfilePhoto = () => {
    const photo = ride.riderProfile.photos?.[0];
    
    if (photo) {
      return (
        <Image source={{ uri: photo }} style={styles.profilePhoto} />
      );
    }
    
    return (
      <View style={styles.profilePhotoPlaceholder}>
        <Ionicons name="person" size={20} color={colors.textSecondary} />
      </View>
    );
  };

  const cardContent = (
    <View style={[styles.container, variant === 'compact' && styles.compactContainer, style]}>
      <View style={styles.header}>
        <View style={styles.riderInfo}>
          {renderProfilePhoto()}
          <View style={styles.riderDetails}>
            <Text style={styles.riderName}>{ride.riderProfile.name}</Text>
            <Text style={styles.riderAge}>Age {ride.riderProfile.age}</Text>
          </View>
        </View>
        
        {showStatus && (
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(ride.status) }]}>
            <Text style={styles.statusText}>{getStatusText(ride.status)}</Text>
          </View>
        )}
      </View>

      <View style={styles.locationContainer}>
        <View style={styles.locationRow}>
          <Ionicons name="radio-button-on" size={12} color={colors.success} />
          <Text style={styles.locationText} numberOfLines={1}>
            {ride.startLocation.address || 'Pickup location'}
          </Text>
        </View>

        {ride.endLocation && (
          <View style={styles.locationRow}>
            <Ionicons name="radio-button-off" size={12} color={colors.error} />
            <Text style={styles.locationText} numberOfLines={1}>
              {ride.endLocation.address || 'Destination'}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
          <Text style={styles.timeText}>{formatDate(ride.createdAt)}</Text>
        </View>

        {variant === 'default' && ride.riderProfile.bio && (
          <Text style={styles.bio} numberOfLines={2}>
            {ride.riderProfile.bio}
          </Text>
        )}
      </View>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={() => onPress(ride)} activeOpacity={0.8}>
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: spacing.medium,
    marginBottom: spacing.medium,
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  compactContainer: {
    padding: spacing.small,
    marginBottom: spacing.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  riderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profilePhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  profilePhotoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  riderDetails: {
    marginLeft: spacing.small,
    flex: 1,
  },
  riderName: {
    ...typography.subtitle,
    color: colors.text,
  },
  riderAge: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.tiny,
    borderRadius: 12,
  },
  statusText: {
    ...typography.small,
    color: colors.background,
    fontWeight: '600',
  },
  locationContainer: {
    marginBottom: spacing.medium,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.tiny,
  },
  locationText: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.small,
    flex: 1,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.small,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  timeText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.tiny,
  },
  bio: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default RideCard;
