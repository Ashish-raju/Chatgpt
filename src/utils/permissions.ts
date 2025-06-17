import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Linking, Platform } from 'react-native';

export interface PermissionResult {
  granted: boolean;
  message?: string;
}

export const requestLocationPermission = async (): Promise<PermissionResult> => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status === 'granted') {
      return { granted: true };
    }
    
    return {
      granted: false,
      message: 'Location permission is required to find nearby rides and provide pickup locations.',
    };
  } catch (error) {
    return {
      granted: false,
      message: 'Failed to request location permission.',
    };
  }
};

export const checkLocationPermission = async (): Promise<PermissionResult> => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    
    if (status === 'granted') {
      return { granted: true };
    }
    
    return {
      granted: false,
      message: 'Location permission is not granted.',
    };
  } catch (error) {
    return {
      granted: false,
      message: 'Failed to check location permission.',
    };
  }
};

export const requestCameraPermission = async (): Promise<PermissionResult> => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status === 'granted') {
      return { granted: true };
    }
    
    return {
      granted: false,
      message: 'Camera permission is required to take photos for your profile and verification.',
    };
  } catch (error) {
    return {
      granted: false,
      message: 'Failed to request camera permission.',
    };
  }
};

export const requestMediaLibraryPermission = async (): Promise<PermissionResult> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status === 'granted') {
      return { granted: true };
    }
    
    return {
      granted: false,
      message: 'Media library permission is required to select photos from your gallery.',
    };
  } catch (error) {
    return {
      granted: false,
      message: 'Failed to request media library permission.',
    };
  }
};

export const checkAllPermissions = async () => {
  const locationResult = await checkLocationPermission();
  const cameraResult = await ImagePicker.getCameraPermissionsAsync();
  const mediaResult = await ImagePicker.getMediaLibraryPermissionsAsync();
  
  return {
    location: locationResult.granted,
    camera: cameraResult.status === 'granted',
    mediaLibrary: mediaResult.status === 'granted',
  };
};

export const showPermissionAlert = (
  title: string,
  message: string,
  onSettingsPress?: () => void
) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Settings',
        onPress: onSettingsPress || openAppSettings,
      },
    ]
  );
};

export const openAppSettings = () => {
  if (Platform.OS === 'ios') {
    Linking.openURL('app-settings:');
  } else {
    Linking.openSettings();
  }
};

export const handlePermissionDenied = (permissionType: string) => {
  const title = `${permissionType} Permission Required`;
  const message = `Please enable ${permissionType.toLowerCase()} permission in your device settings to use this feature.`;
  
  showPermissionAlert(title, message);
};

export const checkLocationEnabled = async (): Promise<boolean> => {
  try {
    const enabled = await Location.hasServicesEnabledAsync();
    
    if (!enabled) {
      Alert.alert(
        'Location Services Disabled',
        'Please enable location services in your device settings to use this feature.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: openAppSettings },
        ]
      );
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
};

export const requestAllRequiredPermissions = async (): Promise<boolean> => {
  try {
    const locationResult = await requestLocationPermission();
    const cameraResult = await requestCameraPermission();
    const mediaResult = await requestMediaLibraryPermission();
    
    const allGranted = locationResult.granted && cameraResult.granted && mediaResult.granted;
    
    if (!allGranted) {
      const deniedPermissions = [];
      if (!locationResult.granted) deniedPermissions.push('Location');
      if (!cameraResult.granted) deniedPermissions.push('Camera');
      if (!mediaResult.granted) deniedPermissions.push('Media Library');
      
      Alert.alert(
        'Permissions Required',
        `The following permissions are required for the app to work properly:\n\n${deniedPermissions.join(', ')}\n\nPlease grant these permissions in your device settings.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Settings', onPress: openAppSettings },
        ]
      );
    }
    
    return allGranted;
  } catch (error) {
    return false;
  }
};
