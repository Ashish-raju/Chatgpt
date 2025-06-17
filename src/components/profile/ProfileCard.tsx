import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserProfile } from '../../types';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

interface ProfileCardProps {
  profile: UserProfile;
  showFullInfo?: boolean;
  style?: any;
}

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = screenWidth - (spacing.large * 2);

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  showFullInfo = false,
  style,
}) => {
  const renderPhotos = () => {
    if (!profile.photos || profile.photos.length === 0) {
      return (
        <View style={styles.noPhotosContainer}>
          <Ionicons name="person-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.noPhotosText}>No Photos</Text>
        </View>
      );
    }

    return (
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.photosContainer}
      >
        {profile.photos.map((photo, index) => (
          <Image
            key={index}
            source={{ uri: photo }}
            style={styles.photo}
            resizeMode="cover"
          />
        ))}
      </ScrollView>
    );
  };

  const renderInfo = () => (
    <View style={styles.infoContainer}>
      <View style={styles.basicInfo}>
        <Text style={styles.name}>{profile.name}</Text>
        <Text style={styles.age}>{profile.age}</Text>
      </View>

      {profile.bio && (
        <Text style={styles.bio} numberOfLines={showFullInfo ? undefined : 3}>
          {profile.bio}
        </Text>
      )}

      {showFullInfo && (
        <>
          {profile.hobbies && profile.hobbies.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hobbies</Text>
              <View style={styles.tagsContainer}>
                {profile.hobbies.map((hobby, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{hobby}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {profile.habits && profile.habits.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Habits</Text>
              <View style={styles.tagsContainer}>
                {profile.habits.map((habit, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{habit}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {profile.personalityTraits && profile.personalityTraits.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Personality</Text>
              <View style={styles.tagsContainer}>
                {profile.personalityTraits.map((trait, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{trait}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );

  return (
    <View style={[styles.container, style]}>
      <View style={styles.card}>
        {renderPhotos()}
        {renderInfo()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  card: {
    width: cardWidth,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  photosContainer: {
    height: 400,
  },
  photo: {
    width: cardWidth,
    height: 400,
  },
  noPhotosContainer: {
    height: 400,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  noPhotosText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.small,
  },
  infoContainer: {
    padding: spacing.large,
  },
  basicInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.medium,
  },
  name: {
    ...typography.heading3,
    color: colors.text,
    flex: 1,
  },
  age: {
    ...typography.body,
    color: colors.textSecondary,
    marginLeft: spacing.small,
  },
  bio: {
    ...typography.body,
    color: colors.text,
    lineHeight: 22,
    marginBottom: spacing.medium,
  },
  section: {
    marginBottom: spacing.medium,
  },
  sectionTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.small,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.small,
  },
  tag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.medium,
    paddingVertical: spacing.small,
    borderRadius: 16,
  },
  tagText: {
    ...typography.caption,
    color: colors.primary,
  },
});

export default ProfileCard;
