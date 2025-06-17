import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import CustomButton from '../../components/common/CustomButton';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

const ProfileScreen: React.FC = () => {
  const { user, signOut, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to sign out');
            }
          },
        },
      ]
    );
  };

  const handleRefreshProfile = async () => {
    setIsLoading(true);
    try {
      await refreshUser();
      Alert.alert('Success', 'Profile refreshed successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to refresh profile');
    } finally {
      setIsLoading(false);
    }
  };

  const getKYCStatusColor = (status?: string) => {
    switch (status) {
      case 'verified':
        return colors.success;
      case 'pending':
        return colors.warning;
      case 'rejected':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getKYCStatusText = (status?: string) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'pending':
        return 'Under Review';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Not Verified';
    }
  };

  const renderProfilePhoto = () => {
    const photo = user?.profile.photos?.[0];
    
    if (photo) {
      return (
        <Image source={{ uri: photo }} style={styles.profilePhoto} />
      );
    }
    
    return (
      <View style={styles.profilePhotoPlaceholder}>
        <Ionicons name="person" size={64} color={colors.textSecondary} />
      </View>
    );
  };

  const renderKYCStatus = () => {
    if (user?.role !== 'rider') return null;

    return (
      <View style={styles.kycContainer}>
        <View style={styles.kycHeader}>
          <Ionicons name="shield-checkmark" size={20} color={getKYCStatusColor(user.kycStatus)} />
          <Text style={styles.kycTitle}>Identity Verification</Text>
        </View>
        <Text style={[styles.kycStatus, { color: getKYCStatusColor(user.kycStatus) }]}>
          {getKYCStatusText(user.kycStatus)}
        </Text>
        {user.kycStatus === 'rejected' && (
          <Text style={styles.kycDescription}>
            Your verification was rejected. Please submit new documents.
          </Text>
        )}
        {user.kycStatus === 'pending' && (
          <Text style={styles.kycDescription}>
            Your documents are being reviewed. This usually takes 1-2 business days.
          </Text>
        )}
      </View>
    );
  };

  const renderProfileInfo = () => (
    <View style={styles.infoContainer}>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Name</Text>
        <Text style={styles.infoValue}>{user?.profile.name}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Age</Text>
        <Text style={styles.infoValue}>{user?.profile.age}</Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Role</Text>
        <Text style={styles.infoValue}>
          {user?.role === 'rider' ? 'Rider' : 'Seeker'}
        </Text>
      </View>
      
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Phone</Text>
        <Text style={styles.infoValue}>{user?.phoneNumber}</Text>
      </View>
      
      {user?.profile.bio && (
        <View style={styles.bioContainer}>
          <Text style={styles.infoLabel}>About</Text>
          <Text style={styles.bioText}>{user.profile.bio}</Text>
        </View>
      )}

      {user?.profile.hobbies && user.profile.hobbies.length > 0 && (
        <View style={styles.tagsContainer}>
          <Text style={styles.infoLabel}>Hobbies</Text>
          <View style={styles.tags}>
            {user.profile.hobbies.map((hobby, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{hobby}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderActions = () => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity style={styles.actionItem}>
        <Ionicons name="create-outline" size={24} color={colors.primary} />
        <Text style={styles.actionText}>Edit Profile</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionItem}>
        <Ionicons name="settings-outline" size={24} color={colors.primary} />
        <Text style={styles.actionText}>Settings</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionItem}>
        <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
        <Text style={styles.actionText}>Help & Support</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.actionItem}>
        <Ionicons name="document-text-outline" size={24} color={colors.primary} />
        <Text style={styles.actionText}>Terms & Privacy</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>User data not available</Text>
          <CustomButton title="Refresh" onPress={handleRefreshProfile} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
            <TouchableOpacity onPress={handleRefreshProfile}>
              <Ionicons name="refresh" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileHeader}>
            {renderProfilePhoto()}
            <Text style={styles.userName}>{user.profile.name}</Text>
            <Text style={styles.userRole}>
              {user.role === 'rider' ? 'Rider' : 'Seeker'}
            </Text>
          </View>

          {renderKYCStatus()}
          {renderProfileInfo()}
          {renderActions()}

          <CustomButton
            title="Sign Out"
            onPress={handleSignOut}
            variant="outline"
            style={styles.signOutButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.large,
  },
  title: {
    ...typography.heading2,
    color: colors.text,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.extraLarge,
  },
  profilePhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: spacing.medium,
  },
  profilePhotoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.medium,
  },
  userName: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: spacing.tiny,
  },
  userRole: {
    ...typography.body,
    color: colors.textSecondary,
  },
  kycContainer: {
    backgroundColor: colors.surface,
    padding: spacing.medium,
    borderRadius: 12,
    marginBottom: spacing.large,
  },
  kycHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  kycTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginLeft: spacing.small,
  },
  kycStatus: {
    ...typography.bodyMedium,
    marginBottom: spacing.small,
  },
  kycDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  infoContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.medium,
    marginBottom: spacing.large,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    ...typography.bodyMedium,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    textAlign: 'right',
  },
  bioContainer: {
    paddingVertical: spacing.small,
  },
  bioText: {
    ...typography.body,
    color: colors.text,
    marginTop: spacing.small,
    lineHeight: 22,
  },
  tagsContainer: {
    paddingVertical: spacing.small,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.small,
    gap: spacing.small,
  },
  tag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.small,
    paddingVertical: spacing.tiny,
    borderRadius: 12,
  },
  tagText: {
    ...typography.caption,
    color: colors.primary,
  },
  actionsContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.large,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionText: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    marginLeft: spacing.medium,
  },
  signOutButton: {
    marginTop: spacing.medium,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.large,
  },
  errorText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.large,
  },
});

export default ProfileScreen;
