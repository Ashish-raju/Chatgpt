import React from 'react';
import { View, Text, TextInput, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface BasicDetailsScreenProps {
  profileName: string;
  setProfileName: (name: string) => void;
  profileAge: string;
  setProfileAge: (age: string) => void;
  profileGender: 'male' | 'female' | 'other';
  setProfileGender: (gender: 'male' | 'female' | 'other') => void;
  profileLocation: string;
  setProfileLocation: (location: string) => void;
  onNext: () => void;
  animatedStyle: any;
  styles: any;
  colors: any;
}

export const BasicDetailsScreen: React.FC<BasicDetailsScreenProps> = ({
  profileName,
  setProfileName,
  profileAge,
  setProfileAge,
  profileGender,
  setProfileGender,
  profileLocation,
  setProfileLocation,
  onNext,
  animatedStyle,
  styles,
  colors,
}) => (
  <Animated.View style={[animatedStyle, { flex: 1 }]}>
    <View style={styles.profileContainer}>
      <LinearGradient colors={[colors.gradient.start, colors.gradient.end]} style={styles.profileGradient}>
        <View style={styles.profileContent}>
          <Text style={styles.profileTitle}>Basic Details</Text>
          <Text style={styles.profileSubtitle}>Tell us about yourself</Text>
          
          <View style={styles.profileForm}>
            <TextInput
              style={styles.profileInput}
              placeholder="Full Name"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={profileName}
              onChangeText={setProfileName}
            />
            <TextInput
              style={styles.profileInput}
              placeholder="Age"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={profileAge}
              onChangeText={setProfileAge}
              keyboardType="numeric"
            />
            
            <View style={styles.genderContainer}>
              <Text style={styles.genderLabel}>Gender</Text>
              <View style={styles.genderOptions}>
                {(['male', 'female', 'other'] as const).map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={[
                      styles.genderOption,
                      profileGender === gender && styles.genderOptionActive
                    ]}
                    onPress={() => setProfileGender(gender)}
                  >
                    <Text style={[
                      styles.genderOptionText,
                      profileGender === gender && styles.genderOptionTextActive
                    ]}>
                      {gender.charAt(0).toUpperCase() + gender.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <TextInput
              style={styles.profileInput}
              placeholder="Location"
              placeholderTextColor="rgba(255,255,255,0.6)"
              value={profileLocation}
              onChangeText={setProfileLocation}
            />
          </View>
        </View>
      </LinearGradient>
      
      <View style={styles.profileButtonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={onNext}>
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.background} />
        </TouchableOpacity>
      </View>
    </View>
  </Animated.View>
);