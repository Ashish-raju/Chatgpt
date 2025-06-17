import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';
import * as ImagePicker from 'expo-image-picker';

class StorageService {
  /**
   * Upload image to Firebase Storage
   */
  async uploadImage(
    uri: string,
    userId: string,
    folder: 'profiles' | 'kyc' | 'rides',
    filename?: string
  ): Promise<string> {
    try {
      // Convert URI to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Generate filename if not provided
      const finalFilename = filename || `${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const imagePath = `${folder}/${userId}/${finalFilename}`;

      // Create storage reference
      const imageRef = ref(storage, imagePath);

      // Upload the blob
      await uploadBytes(imageRef, blob);

      // Get download URL
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      throw new Error(error.message || 'Failed to upload image');
    }
  }

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(
    uris: string[],
    userId: string,
    folder: 'profiles' | 'kyc' | 'rides'
  ): Promise<string[]> {
    try {
      const uploadPromises = uris.map((uri, index) => 
        this.uploadImage(uri, userId, folder, `image_${index}_${Date.now()}`)
      );

      const downloadURLs = await Promise.all(uploadPromises);
      return downloadURLs;
    } catch (error: any) {
      console.error('Error uploading multiple images:', error);
      throw new Error(error.message || 'Failed to upload images');
    }
  }

  /**
   * Delete image from Firebase Storage
   */
  async deleteImage(imageUrl: string): Promise<void> {
    try {
      const imageRef = ref(storage, imageUrl);
      await deleteObject(imageRef);
    } catch (error: any) {
      console.error('Error deleting image:', error);
      throw new Error(error.message || 'Failed to delete image');
    }
  }

  /**
   * Pick image from gallery
   */
  async pickImageFromGallery(): Promise<string | null> {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        throw new Error('Gallery permission denied');
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error: any) {
      console.error('Error picking image from gallery:', error);
      throw new Error(error.message || 'Failed to pick image from gallery');
    }
  }

  /**
   * Take photo with camera
   */
  async takePhotoWithCamera(): Promise<string | null> {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (!permissionResult.granted) {
        throw new Error('Camera permission denied');
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }

      return null;
    } catch (error: any) {
      console.error('Error taking photo with camera:', error);
      throw new Error(error.message || 'Failed to take photo');
    }
  }

  /**
   * Pick multiple images from gallery
   */
  async pickMultipleImagesFromGallery(maxImages: number = 5): Promise<string[]> {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        throw new Error('Gallery permission denied');
      }

      // Launch image picker with multiple selection
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        selectionLimit: maxImages,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        return result.assets.map(asset => asset.uri);
      }

      return [];
    } catch (error: any) {
      console.error('Error picking multiple images:', error);
      throw new Error(error.message || 'Failed to pick images');
    }
  }

  /**
   * Compress image before upload
   */
  async compressImage(uri: string, quality: number = 0.7): Promise<string> {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }

      return uri; // Return original if compression fails
    } catch (error: any) {
      console.error('Error compressing image:', error);
      return uri; // Return original if compression fails
    }
  }

  /**
   * Get file size from URI
   */
  async getFileSize(uri: string): Promise<number> {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      return blob.size;
    } catch (error: any) {
      console.error('Error getting file size:', error);
      return 0;
    }
  }

  /**
   * Validate image file
   */
  async validateImage(uri: string, maxSizeInMB: number = 10): Promise<boolean> {
    try {
      const fileSize = await this.getFileSize(uri);
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
      
      return fileSize <= maxSizeInBytes;
    } catch (error: any) {
      console.error('Error validating image:', error);
      return false;
    }
  }
}

export const storageService = new StorageService();
