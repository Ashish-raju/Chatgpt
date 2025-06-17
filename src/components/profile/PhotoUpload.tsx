import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { storageService } from '../../services/storageService';
import { colors } from '../../styles/colors';
import { typography } from '../../styles/typography';
import { spacing } from '../../styles/spacing';

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  disabled?: boolean;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({
  photos,
  onPhotosChange,
  maxPhotos = 5,
  disabled = false,
}) => {
  const handleAddPhoto = () => {
    if (photos.length >= maxPhotos) {
      Alert.alert('Maximum Photos', `You can only upload up to ${maxPhotos} photos`);
      return;
    }

    Alert.alert(
      'Add Photo',
      'Choose how you want to add a photo',
      [
        {
          text: 'Take Photo',
          onPress: () => addPhotoFromCamera(),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => addPhotoFromGallery(),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const addPhotoFromCamera = async () => {
    try {
      const imageUri = await storageService.takePhotoWithCamera();
      if (imageUri) {
        const isValid = await storageService.validateImage(imageUri);
        if (isValid) {
          onPhotosChange([...photos, imageUri]);
        } else {
          Alert.alert('Invalid Image', 'Please select a valid image file');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to take photo');
    }
  };

  const addPhotoFromGallery = async () => {
    try {
      const imageUri = await storageService.pickImageFromGallery();
      if (imageUri) {
        const isValid = await storageService.validateImage(imageUri);
        if (isValid) {
          onPhotosChange([...photos, imageUri]);
        } else {
          Alert.alert('Invalid Image', 'Please select a valid image file');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pick photo');
    }
  };

  const removePhoto = (index: number) => {
    Alert.alert(
      'Remove Photo',
      'Are you sure you want to remove this photo?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newPhotos = [...photos];
            newPhotos.splice(index, 1);
            onPhotosChange(newPhotos);
          },
        },
      ]
    );
  };

  const movePhoto = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= photos.length) return;
    
    const newPhotos = [...photos];
    const [removed] = newPhotos.splice(fromIndex, 1);
    newPhotos.splice(toIndex, 0, removed);
    onPhotosChange(newPhotos);
  };

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scrollView}>
        {photos.map((photo, index) => (
          <View key={index} style={styles.photoContainer}>
            <Image source={{ uri: photo }} style={styles.photo} />
            <View style={styles.photoOverlay}>
              <Text style={styles.photoNumber}>{index + 1}</Text>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removePhoto(index)}
                disabled={disabled}
              >
                <Ionicons name="close-circle" size={24} color={colors.error} />
              </TouchableOpacity>
            </View>
            {index > 0 && (
              <TouchableOpacity
                style={[styles.moveButton, styles.moveLeftButton]}
                onPress={() => movePhoto(index, index - 1)}
                disabled={disabled}
              >
                <Ionicons name="chevron-back" size={16} color={colors.primary} />
              </TouchableOpacity>
            )}
            {index < photos.length - 1 && (
              <TouchableOpacity
                style={[styles.moveButton, styles.moveRightButton]}
                onPress={() => movePhoto(index, index + 1)}
                disabled={disabled}
              >
                <Ionicons name="chevron-forward" size={16} color={colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        ))}
        
        {photos.length < maxPhotos && (
          <TouchableOpacity
            style={styles.addPhotoButton}
            onPress={handleAddPhoto}
            disabled={disabled}
          >
            <Ionicons name="add" size={32} color={colors.primary} />
            <Text style={styles.addPhotoText}>Add Photo</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      
      <View style={styles.info}>
        <Text style={styles.infoText}>
          {photos.length} of {maxPhotos} photos
        </Text>
        {photos.length === 0 && (
          <Text style={styles.helpText}>
            Add at least one photo to your profile
          </Text>
        )}
        {photos.length > 0 && (
          <Text style={styles.helpText}>
            Your first photo will be your main profile picture
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.medium,
  },
  scrollView: {
    marginBottom: spacing.small,
  },
  photoContainer: {
    position: 'relative',
    marginRight: spacing.medium,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 8,
  },
  photoNumber: {
    position: 'absolute',
    top: spacing.small,
    left: spacing.small,
    backgroundColor: colors.overlay,
    color: colors.buttonPrimaryText,
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  removeButton: {
    position: 'absolute',
    top: spacing.small,
    right: spacing.small,
    backgroundColor: colors.background,
    borderRadius: 12,
  },
  moveButton: {
    position: 'absolute',
    top: '50%',
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 4,
    marginTop: -12,
  },
  moveLeftButton: {
    left: -8,
  },
  moveRightButton: {
    right: -8,
  },
  addPhotoButton: {
    width: 120,
    height: 120,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  addPhotoText: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.tiny,
  },
  info: {
    alignItems: 'center',
  },
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  helpText: {
    ...typography.small,
    color: colors.textTertiary,
    textAlign: 'center',
    marginTop: spacing.tiny,
  },
});

export default PhotoUpload;
