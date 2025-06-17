import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  TextInput,
  Modal,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const colors = {
  primary: '#6E00FF',
  secondary: '#420099',
  background: '#ffffff',
  surface: '#F3F4F6',
  text: '#ffffff',
  textSecondary: '#E5E7EB',
  textDark: '#1F2937',
  border: '#E5E7EB',
  success: '#10B981',
  error: '#EF4444',
  gradient: {
    start: '#6E00FF',
    end: '#420099',
  },
};

const spacing = {
  tiny: 4,
  small: 8,
  medium: 16,
  large: 24,
  extraLarge: 32,
};

// Demo data for interests
const INTERESTS = [
  'Movies', 'Music', 'Photography', 'Travel', 'Foodie', 'Night Drives',
  'Deep Talks', 'Writing', 'Rap', 'Meditation', 'Yoga', 'Gym',
  'Startups', 'Design', 'Philosophy', 'Sarcastic', 'Introvert', 'Kind'
];

type UserRole = 'rider' | 'seeker';
type Gender = 'male' | 'female' | 'other';
type AppState = 'splash' | 'login' | 'profile-basic' | 'profile-interests' | 'role-selection' | 'profile-photos' | 'kyc-verification' | 'home' | 'profile-view' | 'confirmation' | 'waiting' | 'ride-progress';

interface User {
  id: string;
  username: string;
  role: UserRole;
  profile?: {
    name: string;
    age: number;
    gender: Gender;
    location: string;
    photos: string[];
    interests: string[];
  };
  isKycVerified?: boolean;
}

export default function DateRideApp() {
  const [appState, setAppState] = useState<AppState>('splash');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('seeker');
  
  // Profile creation states
  const [profileName, setProfileName] = useState('');
  const [profileAge, setProfileAge] = useState('');
  const [profileGender, setProfileGender] = useState<Gender>('female');
  const [profileLocation, setProfileLocation] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [profilePhotos, setProfilePhotos] = useState<string[]>([]);

  // Current step for multi-step forms
  const [currentStep, setCurrentStep] = useState(0);
  const [isRiderOnline, setIsRiderOnline] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const buttonScaleAnim = useRef(new Animated.Value(1)).current;

  // Trigger animations on state change with easing
  useEffect(() => {
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(appState === 'splash' ? 0.6 : 1);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [appState]);

  const animatedScreenStyle = {
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }, { scale: scaleAnim }],
  };

  // Button press animation
  const handleButtonPress = (onPress: () => void) => {
    Animated.sequence([
      Animated.timing(buttonScaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: false,
      }),
      Animated.timing(buttonScaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false,
      }),
    ]).start();
    onPress();
  };

  useEffect(() => {
    // Simulate app initialization
    setTimeout(() => {
      setAppState('login');
    }, 2500);
  }, []);

  // ✅ Splash Screen matching design
  const renderSplashScreen = () => (
    <Animated.View style={[animatedScreenStyle, { flex: 1 }]}>
      <LinearGradient colors={[colors.gradient.start, colors.gradient.end]} style={styles.splashContainer}>
        <View style={styles.splashContent}>
          <Text style={styles.splashTitle}>Date Ride</Text>
          <Text style={styles.splashSubtitle}>More than just a ride</Text>
          <Ionicons name="heart" size={20} color="rgba(255,255,255,0.6)" style={styles.splashHeart} />
        </View>
      </LinearGradient>
    </Animated.View>
  );

  // ✅ Login Screen matching design
  const renderLoginScreen = () => (
    <View style={styles.loginContainer}>
      <LinearGradient colors={[colors.gradient.start, colors.gradient.end]} style={styles.loginGradientSection}>
        <View style={styles.loginContent}>
          <Text style={styles.loginTitle}>Date Ride</Text>
          <Text style={styles.loginSubtitle}>More than just a ride</Text>
          
          {/* Illustration placeholder */}
          <View style={styles.illustrationContainer}>
            <Ionicons name="people" size={80} color="rgba(255,255,255,0.7)" />
          </View>
        </View>
      </LinearGradient>
      
      <View style={styles.loginFormContainer}>
        <View style={styles.loginForm}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Username</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#9CA3AF"
                value={username}
                onChangeText={setUsername}
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setAppState('role-selection')}>
            <Text style={styles.signupLink}>Signup</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // ✅ Role Selection matching design
  const renderRoleSelection = () => (
    <LinearGradient colors={[colors.gradient.start, colors.gradient.end]} style={styles.roleContainer}>
      <Text style={styles.roleTitle}>Date Ride</Text>
      <Text style={styles.roleMainTitle}>What are you ?</Text>
      <Text style={styles.roleSubtitle}>Choose your Role</Text>

      <View style={styles.roleCardContainer}>
        {selectedRole === 'rider' ? (
          <View style={styles.roleCard}>
            <Ionicons name="bicycle" size={80} color="rgba(255,255,255,0.8)" />
            <Text style={styles.roleCardTitle}>Rider</Text>
            <Text style={styles.roleCardSubtitle}>Pick up your match. Be the hero.</Text>
            <View style={styles.roleIndicator}>
              <View style={styles.activeIndicator} />
              <View style={styles.inactiveIndicator} />
            </View>
          </View>
        ) : (
          <View style={styles.roleCard}>
            <Ionicons name="search" size={80} color="rgba(255,255,255,0.8)" />
            <Text style={styles.roleCardTitle}>Seeker</Text>
            <Text style={styles.roleCardSubtitle}>Request a date-friendly ride.</Text>
            <View style={styles.roleIndicator}>
              <View style={styles.inactiveIndicator} />
              <View style={styles.activeIndicator} />
            </View>
          </View>
        )}
      </View>

      <View style={styles.roleButtons}>
        <TouchableOpacity
          style={[styles.roleToggle, selectedRole === 'rider' && styles.activeRoleToggle]}
          onPress={() => setSelectedRole('rider')}
        />
        <TouchableOpacity
          style={[styles.roleToggle, selectedRole === 'seeker' && styles.activeRoleToggle]}
          onPress={() => setSelectedRole('seeker')}
        />
      </View>

      <TouchableOpacity style={styles.selectButton} onPress={() => setAppState('profile-photos')}>
        <Text style={styles.selectButtonText}>Select</Text>
      </TouchableOpacity>
    </LinearGradient>
  );

  // ✅ Basic Details Profile Creation
  const renderBasicDetails = () => (
    <View style={styles.profilePageContainer}>
      <LinearGradient colors={[colors.gradient.start, colors.gradient.end]} style={styles.profileMainContainer}>
        <Text style={styles.profileTitle}>Date Ride</Text>
        <Text style={styles.profileMainTitle}>Tell us about you</Text>
        <Text style={styles.profileSubtitle}>Your Basic Details</Text>

        <View style={styles.profileForm}>
          <View style={styles.inputContainer}>
            <Text style={styles.profileInputLabel}>Name</Text>
            <TextInput
              style={styles.profileInput}
              value={profileName}
              onChangeText={setProfileName}
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={styles.halfInput}>
              <Text style={styles.profileInputLabel}>Age</Text>
              <View style={styles.ageInputWrapper}>
                <TextInput
                  style={styles.ageInput}
                  value={profileAge}
                  onChangeText={setProfileAge}
                  keyboardType="number-pad"
                />
                <Ionicons name="calendar" size={20} color="#9CA3AF" />
              </View>
            </View>

            <View style={styles.halfInput}>
              <Text style={styles.profileInputLabel}>Gender</Text>
              <View style={styles.genderDropdown}>
                <Text style={styles.genderText}>
                  {profileGender === 'male' ? 'Male' : profileGender === 'female' ? 'Female' : 'Select'}
                </Text>
                <Ionicons name="chevron-down" size={20} color="#9CA3AF" />
              </View>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.profileInputLabel}>Location</Text>
            <View style={styles.locationInputWrapper}>
              <Ionicons name="location" size={20} color="#9CA3AF" style={styles.locationIcon} />
              <TextInput
                style={styles.locationInput}
                value={profileLocation}
                onChangeText={setProfileLocation}
              />
            </View>
          </View>

          <View style={styles.stepIndicator}>
            <View style={styles.activeStep} />
            <View style={styles.inactiveStep} />
          </View>
        </View>
      </LinearGradient>
      
      <View style={styles.profileButtonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={() => setAppState('profile-interests')}>
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.background} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ✅ Interests Selection
  const renderInterestsSelection = () => (
    <View style={styles.profilePageContainer}>
      <LinearGradient colors={[colors.gradient.start, colors.gradient.end]} style={styles.profileMainContainer}>
        <Text style={styles.profileTitle}>Date Ride</Text>
        <Text style={styles.profileMainTitle}>Tell us about you</Text>
        <Text style={styles.profileSubtitle}>Choose your Interests</Text>

        <ScrollView style={styles.interestsContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.interestsGrid}>
            {INTERESTS.map((interest, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.interestTag,
                  selectedInterests.includes(interest) && styles.selectedInterestTag
                ]}
                onPress={() => toggleInterest(interest)}
              >
                <Text style={[
                  styles.interestText,
                  selectedInterests.includes(interest) && styles.selectedInterestText
                ]}>
                  {interest}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.stepIndicator}>
          <View style={styles.inactiveStep} />
          <View style={styles.activeStep} />
        </View>
      </LinearGradient>
      
      <View style={styles.profileButtonContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={() => setAppState('role-selection')}>
          <Text style={styles.nextButtonText}>Next</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.background} />
        </TouchableOpacity>
      </View>
    </View>
  );

  // ✅ Photo Upload
  const renderPhotoUpload = () => (
    <View style={styles.profilePageContainer}>
      <LinearGradient colors={[colors.gradient.start, colors.gradient.end]} style={styles.profileMainContainer}>
        <Text style={styles.profileTitle}>Date Ride</Text>
        <Text style={styles.profileMainTitle}>Tell us about you</Text>
        <Text style={styles.profileSubtitle}>Upload your Photos</Text>

        <View style={styles.photoGrid}>
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <TouchableOpacity key={index} style={styles.photoSlot}>
              {index === 1 && (
                <View style={styles.photoPlaceholder}>
                  <Ionicons name="add" size={24} color="rgba(255,255,255,0.7)" />
                  <Text style={styles.photoPlaceholderText}>Tap to add</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.photoCounter}>1/6</Text>
      </LinearGradient>
      
      <View style={styles.profileButtonContainer}>
        <TouchableOpacity style={styles.completeButton} onPress={handleCompleteProfile}>
          <Text style={styles.completeButtonText}>Complete</Text>
        </TouchableOpacity>

        <TouchableOpacity>
          <Text style={styles.reviewProfileText}>Review Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ✅ KYC Verification for Riders
  const renderKYCVerification = () => (
    <View style={styles.profilePageContainer}>
      <LinearGradient colors={[colors.gradient.start, colors.gradient.end]} style={styles.profileMainContainer}>
        <Text style={styles.profileTitle}>Date Ride</Text>
        <Text style={styles.profileMainTitle}>Verify your Ride</Text>
        <Text style={styles.profileSubtitle}>Complete KYC</Text>

        <View style={styles.kycForm}>
          <TouchableOpacity style={styles.kycUploadButton}>
            <Text style={styles.kycUploadText}>Driver's License Front</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.kycUploadButton}>
            <Text style={styles.kycUploadText}>Driver's License Back</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.kycUploadButton}>
            <Text style={styles.kycUploadText}>Upload your RC</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.kycCounter}>1/6</Text>
      </LinearGradient>
      
      <View style={styles.profileButtonContainer}>
        <TouchableOpacity style={styles.uploadButton} onPress={handleKYCComplete}>
          <Text style={styles.uploadButtonText}>Upload</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ✅ Main Dashboard Router
  const renderMainDashboard = () => {
    if (currentUser?.role === 'rider') {
      return renderRiderDashboard();
    } else {
      return renderSeekerDashboard();
    }
  };

  // ✅ Rider Dashboard
  const renderRiderDashboard = () => (
    <View style={styles.dashboardContainer}>
      <View style={styles.riderHeader}>
        <View style={styles.riderStatusCard}>
          <View style={styles.riderStatusRow}>
            <Text style={styles.riderStatusText}>Ride Partner</Text>
            <TouchableOpacity 
              style={styles.toggleSwitch}
              onPress={() => setIsRiderOnline(!isRiderOnline)}
            >
              <View style={[styles.toggleTrack, isRiderOnline && styles.toggleTrackActive]}>
                <View style={[styles.toggleThumb, isRiderOnline && styles.toggleThumbActive]} />
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Total Rides</Text>
              <Text style={styles.statValue}>16 Rides</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Active Chats</Text>
              <Text style={styles.statValue}>6 New Messages</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          {/* Location pins */}
          <View style={[styles.locationPin, { top: 100, left: 50 }]} />
          <View style={[styles.locationPin, { top: 150, left: 150 }]} />
          <View style={[styles.locationPin, { top: 200, left: 100 }]} />
          <View style={[styles.locationPin, { top: 250, left: 200 }]} />
          
          <View style={styles.centerLocationButton}>
            <Ionicons name="locate" size={24} color={colors.textDark} />
          </View>
        </View>

        {isRiderOnline && (
          <View style={styles.profileCardsContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.profileCard}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=250&fit=crop&crop=face' }}
                  style={styles.profileCardImage}
                />
                <View style={styles.profileCardInfo}>
                  <Text style={styles.profileCardName}>Varun Dhawan</Text>
                  <Text style={styles.profileCardMatch}>82% Match</Text>
                </View>
              </View>

              <View style={styles.profileCard}>
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=250&fit=crop&crop=face' }}
                  style={styles.profileCardImage}
                />
                <View style={styles.profileCardInfo}>
                  <Text style={styles.profileCardName}>Rishabh Pant</Text>
                  <Text style={styles.profileCardMatch}>82% Match</Text>
                </View>
              </View>
            </ScrollView>
          </View>
        )}
      </View>
    </View>
  );

  // ✅ Seeker Dashboard
  const renderSeekerDashboard = () => (
    <View style={styles.dashboardContainer}>
      <View style={styles.riderHeader}>
        <View style={styles.riderStatusCard}>
          <View style={styles.riderStatusRow}>
            <Text style={styles.riderStatusText}>Find Rides</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Available Rides</Text>
              <Text style={styles.statValue}>12 Rides</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Your Matches</Text>
              <Text style={styles.statValue}>3 Matches</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          {/* Location pins for available rides */}
          <View style={[styles.locationPin, { top: 120, left: 80 }]} />
          <View style={[styles.locationPin, { top: 180, left: 180 }]} />
          <View style={[styles.locationPin, { top: 220, left: 120 }]} />
          <View style={[styles.locationPin, { top: 280, left: 220 }]} />
          <View style={[styles.locationPin, { top: 160, left: 60 }]} />
          
          <View style={styles.centerLocationButton}>
            <Ionicons name="locate" size={24} color={colors.textDark} />
          </View>
        </View>

        <View style={styles.profileCardsContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
              <TouchableOpacity 
                style={styles.profileCard} 
                onPress={() => handleButtonPress(() => setAppState('profile-view'))}
                activeOpacity={0.8}
              >
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=250&fit=crop&crop=face' }}
                  style={styles.profileCardImage}
                />
                <View style={styles.profileCardInfo}>
                  <Text style={styles.profileCardName}>Sarah Chen</Text>
                  <Text style={styles.profileCardMatch}>Downtown → Berkeley</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
              <TouchableOpacity 
                style={styles.profileCard} 
                onPress={() => handleButtonPress(() => setAppState('profile-view'))}
                activeOpacity={0.8}
              >
                <Image 
                  source={{ uri: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=250&fit=crop&crop=face' }}
                  style={styles.profileCardImage}
                />
                <View style={styles.profileCardInfo}>
                  <Text style={styles.profileCardName}>Emma Wilson</Text>
                  <Text style={styles.profileCardMatch}>Mission → Park</Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </View>
      </View>
    </View>
  );

  // ✅ Profile View Screen
  const renderProfileView = () => (
    <View style={styles.profileViewContainer}>
      <View style={styles.profileViewHeader}>
        <TouchableOpacity onPress={() => setAppState('home')}>
          <Ionicons name="arrow-back" size={24} color={colors.textDark} />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.profileViewContent}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face' }}
          style={styles.profileViewImage}
        />
        
        <View style={styles.profileViewInfo}>
          <Text style={styles.profileViewName}>Sarah Chen, 26</Text>
          <Text style={styles.profileViewMatch}>92% Match</Text>
          <Text style={styles.profileViewBio}>Professional photographer who loves road trips. Looking for genuine connections and great conversations.</Text>
          
          <View style={styles.profileViewInterests}>
            <Text style={styles.profileViewSection}>Interests</Text>
            <View style={styles.interestsDisplay}>
              {['Photography', 'Travel', 'Coffee', 'Art', 'Nature'].map((interest, index) => (
                <View key={index} style={styles.interestDisplayTag}>
                  <Text style={styles.interestDisplayText}>{interest}</Text>
                </View>
              ))}
            </View>
          </View>
          
          <View style={styles.profileViewRide}>
            <Text style={styles.profileViewSection}>Ride Details</Text>
            <Text style={styles.rideDetailText}>Downtown San Francisco → Berkeley</Text>
            <Text style={styles.rideDetailTime}>Today, 2:30 PM</Text>
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.profileViewActions}>
        <TouchableOpacity style={styles.requestRideButton} onPress={() => setAppState('confirmation')}>
          <Text style={styles.requestRideText}>Request Ride</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // ✅ Confirmation Screen with Heart Burst Animation
  const renderConfirmation = () => (
    <Animated.View style={[animatedScreenStyle, { flex: 1 }]}>
      <LinearGradient colors={[colors.gradient.start, colors.gradient.end]} style={styles.confirmationContainer}>
        <View style={styles.confirmationContent}>
          <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <Ionicons name="checkmark-circle" size={80} color={colors.text} />
          </Animated.View>
          <Text style={styles.confirmationTitle}>Ride Request Sent!</Text>
          <Text style={styles.confirmationSubtitle}>
            Your request has been sent to Sarah. You'll be notified once she responds.
          </Text>
          
          <View style={styles.confirmationDetails}>
            <Text style={styles.confirmationRoute}>Downtown SF → Berkeley</Text>
            <Text style={styles.confirmationTime}>Today, 2:30 PM</Text>
          </View>
        </View>
        
        <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
          <TouchableOpacity 
            style={styles.continueButton} 
            onPress={() => handleButtonPress(() => setAppState('waiting'))}
            activeOpacity={0.8}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
          </TouchableOpacity>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );

  // ✅ Waiting Screen with Bouncing Dots
  const renderWaiting = () => {
    const bounceAnim1 = useRef(new Animated.Value(0)).current;
    const bounceAnim2 = useRef(new Animated.Value(0)).current;
    const bounceAnim3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
      const createBounceAnimation = (animValue: Animated.Value, delay: number) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(animValue, {
              toValue: -10,
              duration: 500,
              useNativeDriver: false,
            }),
            Animated.timing(animValue, {
              toValue: 0,
              duration: 500,
              useNativeDriver: false,
            }),
          ])
        );
      };

      Animated.parallel([
        createBounceAnimation(bounceAnim1, 0),
        createBounceAnimation(bounceAnim2, 200),
        createBounceAnimation(bounceAnim3, 400),
      ]).start();
    }, []);

    return (
      <Animated.View style={[animatedScreenStyle, { flex: 1 }]}>
        <View style={styles.waitingContainer}>
          <View style={styles.waitingContent}>
            <View style={styles.waitingIcon}>
              <View style={styles.bouncingDotsContainer}>
                <Animated.View style={[styles.bouncingDot, { transform: [{ translateY: bounceAnim1 }] }]} />
                <Animated.View style={[styles.bouncingDot, { transform: [{ translateY: bounceAnim2 }] }]} />
                <Animated.View style={[styles.bouncingDot, { transform: [{ translateY: bounceAnim3 }] }]} />
              </View>
            </View>
            
            <Text style={styles.waitingTitle}>Waiting for Confirmation</Text>
            <Text style={styles.waitingSubtitle}>
              Sarah will respond to your ride request soon. We'll notify you once confirmed.
            </Text>
            
            <View style={styles.waitingRideInfo}>
              <View style={styles.waitingRideCard}>
                <Text style={styles.waitingRoute}>Downtown SF → Berkeley</Text>
                <Text style={styles.waitingTime}>Today, 2:30 PM</Text>
                <Text style={styles.waitingRider}>with Sarah Chen</Text>
              </View>
            </View>
            
            <Animated.View style={{ transform: [{ scale: buttonScaleAnim }] }}>
              <TouchableOpacity 
                style={styles.simulateButton} 
                onPress={() => handleButtonPress(() => setAppState('ride-progress'))}
                activeOpacity={0.8}
              >
                <Text style={styles.simulateButtonText}>Simulate Confirmation</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </Animated.View>
    );
  };

  // ✅ Ride Progress Screen
  const renderRideProgress = () => (
    <View style={styles.rideProgressContainer}>
      <View style={styles.rideProgressHeader}>
        <Text style={styles.rideProgressTitle}>Ride in Progress</Text>
        <Text style={styles.rideProgressStatus}>On the way to pickup</Text>
      </View>
      
      <View style={styles.rideProgressMap}>
        <View style={styles.mapPlaceholder}>
          <View style={[styles.locationPin, { top: 150, left: 100, backgroundColor: colors.success }]} />
          <View style={[styles.locationPin, { top: 200, left: 200, backgroundColor: colors.error }]} />
          <Text style={styles.mapLabel}>Route visualization</Text>
        </View>
      </View>
      
      <View style={styles.rideProgressInfo}>
        <View style={styles.rideProgressCard}>
          <Text style={styles.rideProgressRoute}>Downtown SF → Berkeley</Text>
          <Text style={styles.rideProgressEta}>ETA: 15 minutes</Text>
          
          <View style={styles.riderInfo}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=60&h=60&fit=crop&crop=face' }}
              style={styles.riderPhoto}
            />
            <View style={styles.riderDetails}>
              <Text style={styles.riderName}>Sarah Chen</Text>
              <Text style={styles.riderVehicle}>Honda Civic • ABC 123</Text>
            </View>
          </View>
        </View>
        
        <TouchableOpacity style={styles.endRideButton} onPress={() => setAppState('home')}>
          <Text style={styles.endRideButtonText}>End Ride</Text>
        </TouchableOpacity>
      </View>
    </View>
  );



  // Handler functions
  const handleLogin = () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter username and password');
      return;
    }
    setAppState('profile-basic');
  };

  const handleBasicDetailsNext = () => {
    if (!profileName || !profileAge || !profileLocation) {
      Alert.alert('Error', 'Please fill in all basic details');
      return;
    }
    setAppState('profile-interests');
  };

  const handleInterestsNext = () => {
    if (selectedInterests.length === 0) {
      Alert.alert('Error', 'Please select at least one interest');
      return;
    }
    setAppState('role-selection');
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(prev => prev.filter(i => i !== interest));
    } else {
      setSelectedInterests(prev => [...prev, interest]);
    }
  };

  const handleCompleteProfile = () => {
    const user: User = {
      id: Date.now().toString(),
      username,
      role: selectedRole,
      profile: {
        name: profileName,
        age: parseInt(profileAge),
        gender: profileGender,
        location: profileLocation,
        photos: profilePhotos,
        interests: selectedInterests,
      },
      isKycVerified: selectedRole === 'seeker',
    };

    setCurrentUser(user);

    if (selectedRole === 'rider') {
      setAppState('kyc-verification');
    } else {
      setAppState('home');
    }
  };

  const handleKYCComplete = () => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, isKycVerified: true });
    }
    setAppState('home');
  };

  // Main render logic
  switch (appState) {
    case 'splash':
      return renderSplashScreen();
    case 'login':
      return renderLoginScreen();
    case 'role-selection':
      return renderRoleSelection();
    case 'profile-basic':
      return renderBasicDetails();
    case 'profile-interests':
      return renderInterestsSelection();
    case 'profile-photos':
      return renderPhotoUpload();
    case 'kyc-verification':
      return renderKYCVerification();
    case 'home':
      return renderMainDashboard();
    case 'profile-view':
      return renderProfileView();
    case 'confirmation':
      return renderConfirmation();
    case 'waiting':
      return renderWaiting();
    case 'ride-progress':
      return renderRideProgress();
    default:
      return renderSplashScreen();
  }
}

const styles = StyleSheet.create({
  // Splash Screen Styles
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    alignItems: 'center',
  },
  splashTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  splashSubtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  splashHeart: {
    marginTop: 20,
  },

  // Login Screen Styles
  loginContainer: {
    flex: 1,
  },
  loginGradientSection: {
    flex: 0.6,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loginContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginTitle: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 18,
    color: colors.textSecondary,
    marginBottom: 40,
  },
  illustrationContainer: {
    marginVertical: 40,
  },
  loginFormContainer: {
    flex: 0.4,
    backgroundColor: colors.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 40,
    paddingVertical: 40,
    justifyContent: 'center',
  },
  loginForm: {
    gap: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: colors.textDark,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 64,
    width: 320,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#230050',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 12,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.background,
  },
  signupLink: {
    fontSize: 16,
    color: colors.textDark,
    textAlign: 'center',
    marginTop: 20,
    textDecorationLine: 'underline',
  },

  // Role Selection Styles
  roleContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  roleTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 40,
  },
  roleMainTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  roleSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 60,
  },
  roleCardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  roleCardTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  roleCardSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
  },
  roleIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  activeIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.text,
  },
  inactiveIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  roleButtons: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 40,
  },
  roleToggle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  activeRoleToggle: {
    backgroundColor: colors.text,
  },
  selectButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 64,
    width: 320,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#230050',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 12,
  },
  selectButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.background,
  },

  // Profile Creation Styles
  profileContainer: {
    flex: 1,
    paddingHorizontal: 40,
    paddingTop: 80,
  },
  profilePageContainer: {
    flex: 1,
  },
  profileMainContainer: {
    paddingHorizontal: 40,
    paddingTop: 80,
    paddingBottom: 80,
    borderBottomLeftRadius: 1155,
    borderBottomRightRadius: 1155,
    minHeight: height * 0.75,
  },
  profileButtonContainer: {
    backgroundColor: colors.background,
    alignItems: 'center',
    paddingVertical: 40,
    flex: 1,
    justifyContent: 'center',
  },
  profileTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 40,
  },
  profileMainTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  profileSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 60,
  },
  profileForm: {
    gap: 24,
  },
  profileInputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  profileInput: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.textDark,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 16,
  },
  halfInput: {
    flex: 1,
  },
  ageInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  ageInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textDark,
  },
  genderDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  genderText: {
    fontSize: 16,
    color: colors.textDark,
  },
  locationInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  locationIcon: {
    marginRight: 12,
  },
  locationInput: {
    flex: 1,
    fontSize: 16,
    color: colors.textDark,
  },
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  activeStep: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.text,
  },
  inactiveStep: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 64,
    width: 320,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#230050',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 12,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.background,
  },

  // Interests Styles
  interestsContainer: {
    flex: 1,
    marginBottom: 40,
  },
  interestsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  interestTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  selectedInterestTag: {
    backgroundColor: '#FFD700',
  },
  interestText: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  selectedInterestText: {
    color: colors.textDark,
  },

  // Photo Upload Styles
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  photoSlot: {
    width: (width - 120) / 3,
    height: 120,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    borderStyle: 'dashed',
  },
  photoPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  photoCounter: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 40,
  },
  photoActions: {
    gap: 20,
  },
  completeButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 64,
    width: 320,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#230050',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 12,
  },
  completeButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.background,
  },
  reviewProfileText: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },

  // KYC Styles
  kycForm: {
    flex: 1,
    gap: 24,
  },
  kycUploadButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  kycUploadText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  kycCounter: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 40,
  },
  uploadButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 64,
    width: 320,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#230050',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 1,
    elevation: 12,
  },
  uploadButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.background,
  },

  // Dashboard Styles
  dashboardContainer: {
    flex: 1,
    backgroundColor: '#E5E7EB',
  },
  riderHeader: {
    padding: 20,
  },
  riderStatusCard: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 20,
  },
  riderStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  riderStatusText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textDark,
  },
  toggleSwitch: {
    width: 60,
    height: 30,
  },
  toggleTrack: {
    flex: 1,
    backgroundColor: '#D1D5DB',
    borderRadius: 15,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleTrackActive: {
    backgroundColor: colors.primary,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    backgroundColor: colors.background,
    borderRadius: 13,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  toggleThumbActive: {
    transform: [{ translateX: 30 }],
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textDark,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#D1D5DB',
    position: 'relative',
  },
  locationPin: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  centerLocationButton: {
    position: 'absolute',
    bottom: 200,
    alignSelf: 'center',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  profileCardsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
  },
  profileCard: {
    width: 160,
    backgroundColor: colors.background,
    borderRadius: 12,
    marginRight: 16,
    overflow: 'hidden',
  },
  profileCardImage: {
    width: '100%',
    height: 120,
  },
  profileCardInfo: {
    padding: 12,
  },
  profileCardName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 4,
  },
  profileCardMatch: {
    fontSize: 14,
    color: colors.textDark,
  },

  // Profile View Styles
  profileViewContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  profileViewHeader: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.background,
  },
  profileViewContent: {
    flex: 1,
  },
  profileViewImage: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
  },
  profileViewInfo: {
    padding: 20,
  },
  profileViewName: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 8,
  },
  profileViewMatch: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 16,
  },
  profileViewBio: {
    fontSize: 16,
    color: colors.textDark,
    lineHeight: 24,
    marginBottom: 24,
  },
  profileViewSection: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 12,
  },
  profileViewInterests: {
    marginBottom: 24,
  },
  interestsDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestDisplayTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  interestDisplayText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },
  profileViewRide: {
    marginBottom: 24,
  },
  rideDetailText: {
    fontSize: 16,
    color: colors.textDark,
    fontWeight: '600',
    marginBottom: 4,
  },
  rideDetailTime: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  profileViewActions: {
    padding: 20,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  requestRideButton: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  requestRideText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },

  // Confirmation Screen Styles
  confirmationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmationContent: {
    alignItems: 'center',
    marginBottom: 40,
  },
  confirmationTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmationSubtitle: {
    fontSize: 16,
    color: colors.text,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
    opacity: 0.8,
  },
  confirmationDetails: {
    alignItems: 'center',
  },
  confirmationRoute: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  confirmationTime: {
    fontSize: 14,
    color: colors.text,
    opacity: 0.7,
  },
  continueButton: {
    backgroundColor: colors.text,
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 12,
  },
  continueButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },

  // Waiting Screen Styles
  waitingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    padding: 20,
  },
  waitingContent: {
    alignItems: 'center',
  },
  waitingIcon: {
    marginBottom: 24,
  },
  waitingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 12,
    textAlign: 'center',
  },
  waitingSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  waitingRideInfo: {
    width: '100%',
    marginBottom: 32,
  },
  waitingRideCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  waitingRoute: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 4,
  },
  waitingTime: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  waitingRider: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  simulateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  simulateButtonText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
  },

  // Ride Progress Screen Styles
  rideProgressContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  rideProgressHeader: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  rideProgressTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textDark,
    marginBottom: 4,
  },
  rideProgressStatus: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  rideProgressMap: {
    flex: 1,
    margin: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapLabel: {
    fontSize: 16,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  rideProgressInfo: {
    padding: 20,
  },
  rideProgressCard: {
    backgroundColor: '#f8f9fa',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
  },
  rideProgressRoute: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 8,
  },
  rideProgressEta: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  riderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  riderPhoto: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  riderDetails: {
    flex: 1,
  },
  riderName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textDark,
    marginBottom: 2,
  },
  riderVehicle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  endRideButton: {
    backgroundColor: colors.error,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  endRideButtonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
  },

  // Gender Selection Styles
  genderContainer: {
    marginBottom: 20,
  },
  genderLabel: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 12,
    fontWeight: '500',
  },
  genderOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  genderOptionActive: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderColor: colors.text,
  },
  genderOptionText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  genderOptionTextActive: {
    color: colors.text,
    fontWeight: '600',
  },

  // Bouncing Dots Animation
  bouncingDotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bouncingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
});