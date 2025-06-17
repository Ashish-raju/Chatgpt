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
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../../navigation/AuthNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/userService';
import { storageService } from '../../services/storageService';
import CustomButton from '../../components/common/CustomButton';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

type KYCVerificationScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'KYCVerification'
>;

interface Props {
  navigation: KYCVerificationScreenNavigationProp;
}

type DocumentType = 'passport' | 'drivers_license' | 'national_id';

interface DocumentOption {
  type: DocumentType;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const documentOptions: DocumentOption[] = [
  {
    type: 'drivers_license',
    title: 'Driver\'s License',
    description: 'Upload a photo of your driver\'s license',
    icon: 'card-outline',
  },
  {
    type: 'passport',
    title: 'Passport',
    description: 'Upload a photo of your passport',
    icon: 'document-outline',
  },
  {
    type: 'national_id',
    title: 'National ID',
    description: 'Upload a photo of your national ID card',
    icon: 'id-card-outline',
  },
];

const KYCVerificationScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType | null>(null);
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDocumentCapture = async (method: 'camera' | 'gallery') => {
    try {
      let imageUri: string | null = null;

      if (method === 'camera') {
        imageUri = await storageService.takePhotoWithCamera();
      } else {
        imageUri = await storageService.pickImageFromGallery();
      }

      if (imageUri) {
        // Validate image size
        const isValid = await storageService.validateImage(imageUri, 10); // 10MB max
        if (!isValid) {
          Alert.alert('File Too Large', 'Please select an image smaller than 10MB');
          return;
        }

        setDocumentImage(imageUri);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to capture document');
    }
  };

  const showDocumentCaptureOptions = () => {
    Alert.alert(
      'Select Document Photo',
      'Choose how you want to add your document photo',
      [
        {
          text: 'Take Photo',
          onPress: () => handleDocumentCapture('camera'),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => handleDocumentCapture('gallery'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleSubmitVerification = async () => {
    if (!selectedDocumentType) {
      Alert.alert('Document Type Required', 'Please select a document type');
      return;
    }

    if (!documentImage) {
      Alert.alert('Document Photo Required', 'Please upload a photo of your document');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not found');
      return;
    }

    setIsLoading(true);
    try {
      // Upload document image to Firebase Storage
      const documentUrl = await storageService.uploadImage(
        documentImage,
        user.id,
        'kyc',
        `kyc_${selectedDocumentType}_${Date.now()}`
      );

      // Create KYC document record
      await userService.uploadKYCDocument(user.id, selectedDocumentType, documentUrl);

      Alert.alert(
        'Verification Submitted',
        'Your identity document has been submitted for verification. You will be notified once the review is complete.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigation will be handled by auth context when user data updates
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit verification');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Ionicons name="shield-checkmark" size={64} color={colors.primary} />
            <Text style={styles.title}>Identity Verification</Text>
            <Text style={styles.subtitle}>
              To ensure safety for all users, riders must verify their identity with a government-issued ID
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Document Type</Text>
            {documentOptions.map((option) => (
              <TouchableOpacity
                key={option.type}
                style={[
                  styles.documentOption,
                  selectedDocumentType === option.type && styles.selectedOption,
                ]}
                onPress={() => setSelectedDocumentType(option.type)}
              >
                <Ionicons
                  name={option.icon}
                  size={24}
                  color={selectedDocumentType === option.type ? colors.primary : colors.textSecondary}
                />
                <View style={styles.documentInfo}>
                  <Text style={[
                    styles.documentTitle,
                    selectedDocumentType === option.type && styles.selectedText,
                  ]}>
                    {option.title}
                  </Text>
                  <Text style={styles.documentDescription}>
                    {option.description}
                  </Text>
                </View>
                <Ionicons
                  name={selectedDocumentType === option.type ? 'radio-button-on' : 'radio-button-off'}
                  size={24}
                  color={selectedDocumentType === option.type ? colors.primary : colors.textSecondary}
                />
              </TouchableOpacity>
            ))}
          </View>

          {selectedDocumentType && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Upload Document Photo</Text>
              
              {documentImage ? (
                <View style={styles.imageContainer}>
                  <Image source={{ uri: documentImage }} style={styles.documentPreview} />
                  <TouchableOpacity
                    style={styles.retakeButton}
                    onPress={showDocumentCaptureOptions}
                  >
                    <Ionicons name="camera" size={20} color={colors.primary} />
                    <Text style={styles.retakeText}>Retake Photo</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity
                  style={styles.uploadButton}
                  onPress={showDocumentCaptureOptions}
                >
                  <Ionicons name="cloud-upload-outline" size={48} color={colors.primary} />
                  <Text style={styles.uploadText}>Upload Document Photo</Text>
                  <Text style={styles.uploadSubtext}>
                    Take a clear photo of your {documentOptions.find(d => d.type === selectedDocumentType)?.title.toLowerCase()}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          <View style={styles.guidelines}>
            <Text style={styles.guidelinesTitle}>Photo Guidelines</Text>
            <View style={styles.guideline}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.guidelineText}>Ensure all text is clearly visible</Text>
            </View>
            <View style={styles.guideline}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.guidelineText}>Take photo in good lighting</Text>
            </View>
            <View style={styles.guideline}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.guidelineText}>Avoid glare and shadows</Text>
            </View>
            <View style={styles.guideline}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={styles.guidelineText}>Document should fill most of the frame</Text>
            </View>
          </View>

          <CustomButton
            title="Submit for Verification"
            onPress={handleSubmitVerification}
            disabled={!selectedDocumentType || !documentImage}
            style={styles.submitButton}
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
    alignItems: 'center',
    marginBottom: spacing.extraLarge,
  },
  title: {
    ...typography.heading2,
    color: colors.text,
    textAlign: 'center',
    marginTop: spacing.medium,
    marginBottom: spacing.small,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  section: {
    marginBottom: spacing.extraLarge,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: spacing.medium,
  },
  documentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.medium,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    marginBottom: spacing.small,
  },
  selectedOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  documentInfo: {
    flex: 1,
    marginLeft: spacing.medium,
  },
  documentTitle: {
    ...typography.subtitle,
    color: colors.text,
  },
  selectedText: {
    color: colors.primary,
  },
  documentDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  imageContainer: {
    alignItems: 'center',
  },
  documentPreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  retakeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.medium,
    padding: spacing.small,
  },
  retakeText: {
    ...typography.button,
    color: colors.primary,
    marginLeft: spacing.small,
  },
  uploadButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.extraLarge,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
  },
  uploadText: {
    ...typography.subtitle,
    color: colors.primary,
    marginTop: spacing.medium,
  },
  uploadSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.small,
  },
  guidelines: {
    backgroundColor: colors.surface,
    padding: spacing.medium,
    borderRadius: 12,
    marginBottom: spacing.extraLarge,
  },
  guidelinesTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.medium,
  },
  guideline: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  guidelineText: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.small,
  },
  submitButton: {
    marginBottom: spacing.extraLarge,
  },
});

export default KYCVerificationScreen;
