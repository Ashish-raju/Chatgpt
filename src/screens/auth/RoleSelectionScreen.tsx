import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import CustomButton from '../../components/common/CustomButton';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

type RoleSelectionScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'RoleSelection'
>;

interface Props {
  navigation: RoleSelectionScreenNavigationProp;
}

const RoleSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const [selectedRole, setSelectedRole] = useState<'rider' | 'seeker' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleContinue = async () => {
    if (!selectedRole) {
      Alert.alert('Select Role', 'Please select whether you want to be a Rider or Seeker');
      return;
    }

    setIsLoading(true);
    try {
      navigation.navigate('ProfileCreation', { role: selectedRole });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Role</Text>
          <Text style={styles.subtitle}>
            Select how you'd like to use Rider-Seeker
          </Text>
        </View>

        <View style={styles.rolesContainer}>
          <TouchableOpacity
            style={[
              styles.roleCard,
              selectedRole === 'rider' && styles.selectedCard,
            ]}
            onPress={() => setSelectedRole('rider')}
          >
            <View style={styles.roleIcon}>
              <Ionicons
                name="car"
                size={48}
                color={selectedRole === 'rider' ? colors.primary : colors.textSecondary}
              />
            </View>
            <Text style={[
              styles.roleTitle,
              selectedRole === 'rider' && styles.selectedText,
            ]}>
              I'm a Rider
            </Text>
            <Text style={styles.roleDescription}>
              Offer rides to others and potentially meet new people
            </Text>
            <View style={styles.features}>
              <Text style={styles.featureText}>• Offer rides to earn money</Text>
              <Text style={styles.featureText}>• Meet compatible travelers</Text>
              <Text style={styles.featureText}>• Requires ID verification</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleCard,
              selectedRole === 'seeker' && styles.selectedCard,
            ]}
            onPress={() => setSelectedRole('seeker')}
          >
            <View style={styles.roleIcon}>
              <Ionicons
                name="search"
                size={48}
                color={selectedRole === 'seeker' ? colors.primary : colors.textSecondary}
              />
            </View>
            <Text style={[
              styles.roleTitle,
              selectedRole === 'seeker' && styles.selectedText,
            ]}>
              I'm a Seeker
            </Text>
            <Text style={styles.roleDescription}>
              Find rides and potentially connect with interesting drivers
            </Text>
            <View style={styles.features}>
              <Text style={styles.featureText}>• Find convenient rides</Text>
              <Text style={styles.featureText}>• Browse driver profiles</Text>
              <Text style={styles.featureText}>• Quick setup process</Text>
            </View>
          </TouchableOpacity>
        </View>

        <CustomButton
          title="Continue"
          onPress={handleContinue}
          disabled={!selectedRole}
          style={styles.continueButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing.large,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.extraLarge,
    marginTop: spacing.large,
  },
  title: {
    ...typography.heading1,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.small,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  rolesContainer: {
    flex: 1,
    gap: spacing.large,
  },
  roleCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: spacing.large,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  roleIcon: {
    marginBottom: spacing.medium,
  },
  roleTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: spacing.small,
  },
  selectedText: {
    color: colors.primary,
  },
  roleDescription: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.medium,
  },
  features: {
    alignItems: 'flex-start',
    gap: spacing.small,
  },
  featureText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  continueButton: {
    marginTop: spacing.large,
    marginBottom: spacing.medium,
  },
});

export default RoleSelectionScreen;
