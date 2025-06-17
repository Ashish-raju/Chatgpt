import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import CustomInput from '../../components/common/CustomInput';
import CustomButton from '../../components/common/CustomButton';
import PhotoUpload from '../../components/profile/PhotoUpload';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { UserProfile } from '../../types';
import { validateProfile } from '../../utils/validation';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

type ProfileCreationScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'ProfileCreation'
>;

type ProfileCreationScreenRouteProp = RouteProp<
  AuthStackParamList,
  'ProfileCreation'
>;

interface Props {
  navigation: ProfileCreationScreenNavigationProp;
  route: ProfileCreationScreenRouteProp;
}

const ProfileCreationScreen: React.FC<Props> = ({ navigation, route }) => {
  const { role } = route.params;
  const [isLoading, setIsLoading] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: '',
    age: '',
    bio: '',
    hobbies: '',
    habits: '',
    personalityTraits: '',
    photos: [],
  });

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhotosChange = (newPhotos: string[]) => {
    setPhotos(newPhotos);
    setProfile(prev => ({
      ...prev,
      photos: newPhotos,
    }));
  };

  const handleCreateProfile = async () => {
    const validationError = validateProfile(profile);
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    if (photos.length === 0) {
      Alert.alert('Photos Required', 'Please add at least one photo to your profile');
      return;
    }

    setIsLoading(true);
    try {
      const currentUser = await authService.getCurrentUser();
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }

      const userProfile: UserProfile = {
        name: profile.name!,
        age: parseInt(profile.age as string),
        bio: profile.bio!,
        photos,
        hobbies: (profile.hobbies as string).split(',').map(h => h.trim()).filter(h => h),
        habits: (profile.habits as string).split(',').map(h => h.trim()).filter(h => h),
        personalityTraits: (profile.personalityTraits as string).split(',').map(p => p.trim()).filter(p => p),
      };

      await userService.createUser(
        currentUser.uid,
        currentUser.phoneNumber || '',
        role,
        userProfile
      );

      if (role === 'rider') {
        navigation.navigate('KYCVerification');
      } else {
        // Profile creation complete for seekers
        // The auth context will handle navigation to main app
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create profile');
    } finally {
      setIsLoading(false);
    }
  };

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
              <Text style={styles.title}>Create Your Profile</Text>
              <Text style={styles.subtitle}>
                Tell others about yourself to find better matches
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Photos</Text>
              <PhotoUpload
                photos={photos}
                onPhotosChange={handlePhotosChange}
                maxPhotos={5}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              <CustomInput
                placeholder="Full Name"
                value={profile.name}
                onChangeText={(value) => handleInputChange('name', value)}
                returnKeyType="next"
              />
              <CustomInput
                placeholder="Age"
                value={profile.age}
                onChangeText={(value) => handleInputChange('age', value)}
                keyboardType="number-pad"
                returnKeyType="next"
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About You</Text>
              <CustomInput
                placeholder="Tell us about yourself..."
                value={profile.bio}
                onChangeText={(value) => handleInputChange('bio', value)}
                multiline
                numberOfLines={4}
                style={styles.textArea}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Interests & Personality</Text>
              <CustomInput
                placeholder="Hobbies (comma separated)"
                value={profile.hobbies}
                onChangeText={(value) => handleInputChange('hobbies', value)}
                returnKeyType="next"
              />
              <CustomInput
                placeholder="Habits (comma separated)"
                value={profile.habits}
                onChangeText={(value) => handleInputChange('habits', value)}
                returnKeyType="next"
              />
              <CustomInput
                placeholder="Personality traits (comma separated)"
                value={profile.personalityTraits}
                onChangeText={(value) => handleInputChange('personalityTraits', value)}
                returnKeyType="done"
              />
            </View>

            <CustomButton
              title="Create Profile"
              onPress={handleCreateProfile}
              style={styles.createButton}
            />
          </View>
        </ScrollView>
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
    alignItems: 'center',
    marginBottom: spacing.extraLarge,
  },
  title: {
    ...typography.heading2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.small,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: spacing.extraLarge,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: spacing.medium,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  createButton: {
    marginTop: spacing.medium,
    marginBottom: spacing.extraLarge,
  },
});

export default ProfileCreationScreen;
