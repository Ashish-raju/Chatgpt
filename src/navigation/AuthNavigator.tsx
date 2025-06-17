import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PhoneAuthScreen from '../screens/auth/PhoneAuthScreen';
import VerificationScreen from '../screens/auth/VerificationScreen';
import RoleSelectionScreen from '../screens/auth/RoleSelectionScreen';
import ProfileCreationScreen from '../screens/profile/ProfileCreationScreen';
import KYCVerificationScreen from '../screens/profile/KYCVerificationScreen';

export type AuthStackParamList = {
  PhoneAuth: undefined;
  Verification: {
    phoneNumber: string;
    verificationId: string;
  };
  RoleSelection: undefined;
  ProfileCreation: {
    role: 'rider' | 'seeker';
  };
  KYCVerification: undefined;
};

const Stack = createStackNavigator<AuthStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#333333',
        headerTitle: '',
      }}
    >
      <Stack.Screen 
        name="PhoneAuth" 
        component={PhoneAuthScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Verification" 
        component={VerificationScreen}
        options={{ title: 'Verify Phone' }}
      />
      <Stack.Screen 
        name="RoleSelection" 
        component={RoleSelectionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ProfileCreation" 
        component={ProfileCreationScreen}
        options={{ title: 'Create Profile' }}
      />
      <Stack.Screen 
        name="KYCVerification" 
        component={KYCVerificationScreen}
        options={{ title: 'Verify Identity' }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
