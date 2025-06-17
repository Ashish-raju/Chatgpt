import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const colors = {
  primary: '#6366f1',
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#1f2937',
  textSecondary: '#6b7280',
  border: '#e5e7eb',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  swipeLike: '#10b981',
  swipePass: '#ef4444',
};

const spacing = {
  tiny: 4,
  small: 8,
  medium: 16,
  large: 24,
  extraLarge: 32,
};

const typography = {
  heading1: { fontSize: 32, fontWeight: '700' as const },
  heading2: { fontSize: 24, fontWeight: '600' as const },
  heading3: { fontSize: 20, fontWeight: '600' as const },
  body: { fontSize: 16, fontWeight: '400' as const },
  caption: { fontSize: 14, fontWeight: '400' as const },
};

const DEMO_RIDES = [
  {
    id: '1',
    rider: {
      name: 'Sarah Chen',
      age: 26,
      photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      bio: 'Professional photographer who loves road trips. I enjoy meeting creative people and sharing stories during rides.',
    },
    pickup: 'Downtown San Francisco',
    destination: 'Berkeley',
    time: '2:30 PM',
    distance: '15.2 km',
  },
  {
    id: '2',
    rider: {
      name: 'Mike Rodriguez',
      age: 32,
      photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face',
      bio: 'Tech entrepreneur who loves podcasts and deep conversations.',
    },
    pickup: 'Financial District',
    destination: 'Palo Alto',
    time: '4:15 PM',
    distance: '22.8 km',
  },
  {
    id: '3',
    rider: {
      name: 'Emma Wilson',
      age: 24,
      photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face',
      bio: 'Art student exploring the city. Love meeting fellow creatives!',
    },
    pickup: 'Mission District',
    destination: 'Golden Gate Park',
    time: '6:00 PM',
    distance: '8.5 km',
  },
];

export default function DemoApp() {
  const [currentView, setCurrentView] = useState<'home' | 'swipe' | 'matches' | 'profile'>('home');
  const [userRole, setUserRole] = useState<'seeker' | 'rider'>('seeker');
  const [currentRideIndex, setCurrentRideIndex] = useState(0);
  const [matches, setMatches] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [fromLocation, setFromLocation] = useState('');
  const [toLocation, setToLocation] = useState('');
  const [showLocationSearch, setShowLocationSearch] = useState(false);

  const currentRide = DEMO_RIDES[currentRideIndex];

  const handleSwipe = (direction: 'like' | 'pass') => {
    if (direction === 'like') {
      // Seeker likes a rider - add to matches and send notification to rider
      setMatches(prev => [...prev, { ...currentRide, status: 'pending', matchType: 'seeker_liked' }]);
      
      // Simulate notification to rider
      const notification = {
        id: Date.now(),
        type: 'seeker_interest',
        seeker: {
          name: 'Alex Johnson',
          age: 28,
          photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
        },
        ride: currentRide,
        timestamp: new Date(),
      };
      setNotifications(prev => [...prev, notification]);
    }
    
    if (currentRideIndex < DEMO_RIDES.length - 1) {
      setCurrentRideIndex(prev => prev + 1);
    } else {
      setCurrentRideIndex(0);
    }
  };

  const handleRoleSwitch = (role: 'seeker' | 'rider') => {
    setUserRole(role);
    if (role === 'seeker') {
      setCurrentView('home');
    } else {
      setCurrentView('matches'); // Show notifications for riders
    }
  };

  const handleLocationSearch = () => {
    if (!fromLocation.trim()) {
      alert('Please enter pickup location');
      return;
    }
    setShowLocationSearch(false);
    setCurrentView('swipe');
  };

  const handleRiderResponse = (notification: any, response: 'accept' | 'decline') => {
    if (response === 'accept') {
      // Rider accepts - reveal locations and start ride coordination
      setMatches(prev => prev.map(match => 
        match.id === notification.ride.id 
          ? { ...match, status: 'matched', riderAccepted: true }
          : match
      ));
      
      // Remove notification
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
      
      alert(`Great! You accepted ${notification.seeker.name}'s request. Navigate to pickup location: ${fromLocation || 'Downtown San Francisco'}`);
    } else {
      // Remove notification
      setNotifications(prev => prev.filter(n => n.id !== notification.id));
    }
  };

  const renderSwipeCard = () => {
    if (!currentRide) return null;

    return (
      <View style={styles.swipeCard}>
        <Image source={{ uri: currentRide.rider.photo }} style={styles.riderPhoto} />
        
        <View style={styles.cardContent}>
          <Text style={styles.riderName}>{currentRide.rider.name}, {currentRide.rider.age}</Text>
          <Text style={styles.riderBio}>{currentRide.rider.bio}</Text>
          
          <View style={styles.rideDetails}>
            <View style={styles.locationRow}>
              <Ionicons name="radio-button-on" size={16} color={colors.success} />
              <Text style={styles.locationText}>{currentRide.pickup}</Text>
            </View>
            <View style={styles.locationRow}>
              <Ionicons name="radio-button-off" size={16} color={colors.error} />
              <Text style={styles.locationText}>{currentRide.destination}</Text>
            </View>
            
            <View style={styles.rideInfo}>
              <View style={styles.infoItem}>
                <Ionicons name="time" size={16} color={colors.textSecondary} />
                <Text style={styles.infoText}>{currentRide.time}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="speedometer" size={16} color={colors.textSecondary} />
                <Text style={styles.infoText}>{currentRide.distance}</Text>
              </View>
            </View>
          </View>
        </View>
        
        <View style={styles.swipeActions}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.passButton]}
            onPress={() => handleSwipe('pass')}
          >
            <Ionicons name="close" size={32} color={colors.background} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.likeButton]}
            onPress={() => handleSwipe('like')}
          >
            <Ionicons name="heart" size={32} color={colors.background} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderProfile = () => (
    <ScrollView style={styles.profileContainer}>
      <View style={styles.profileHeader}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face' }} 
          style={styles.profilePhoto} 
        />
        <Text style={styles.profileName}>Alex Johnson</Text>
        <Text style={styles.profileRole}>Seeker</Text>
      </View>
      
      <View style={styles.profileInfo}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Age</Text>
          <Text style={styles.infoValue}>28</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Hobbies</Text>
          <Text style={styles.infoValue}>Travel, Photography, Coffee</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Matches</Text>
          <Text style={styles.infoValue}>{matches.length}</Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderHome = () => (
    <ScrollView style={styles.homeContainer}>
      <View style={styles.roleSelector}>
        <Text style={styles.welcomeText}>Welcome to Rider-Seeker!</Text>
        <Text style={styles.roleQuestion}>What would you like to do today?</Text>
        
        <View style={styles.roleButtons}>
          <TouchableOpacity 
            style={[styles.roleButton, userRole === 'seeker' && styles.activeRoleButton]}
            onPress={() => handleRoleSwitch('seeker')}
          >
            <Ionicons name="search" size={32} color={userRole === 'seeker' ? colors.background : colors.primary} />
            <Text style={[styles.roleButtonText, userRole === 'seeker' && styles.activeRoleButtonText]}>
              Find a Ride
            </Text>
            <Text style={[styles.roleDescription, userRole === 'seeker' && styles.activeRoleDescription]}>
              I need a ride somewhere
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.roleButton, userRole === 'rider' && styles.activeRoleButton]}
            onPress={() => handleRoleSwitch('rider')}
          >
            <Ionicons name="car" size={32} color={userRole === 'rider' ? colors.background : colors.primary} />
            <Text style={[styles.roleButtonText, userRole === 'rider' && styles.activeRoleButtonText]}>
              Offer a Ride
            </Text>
            <Text style={[styles.roleDescription, userRole === 'rider' && styles.activeRoleDescription]}>
              I can give someone a ride
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {userRole === 'seeker' && (
        <View style={styles.locationInputs}>
          <Text style={styles.sectionTitle}>Where do you want to go?</Text>
          
          <View style={styles.inputContainer}>
            <Ionicons name="radio-button-on" size={20} color={colors.success} />
            <TextInput
              style={styles.locationInput}
              placeholder="Pickup location"
              value={fromLocation}
              onChangeText={setFromLocation}
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Ionicons name="radio-button-off" size={20} color={colors.error} />
            <TextInput
              style={styles.locationInput}
              placeholder="Destination"
              value={toLocation}
              onChangeText={setToLocation}
            />
          </View>
          
          <TouchableOpacity style={styles.searchButton} onPress={handleLocationSearch}>
            <Text style={styles.searchButtonText}>Find Riders Near Me</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.background} />
          </TouchableOpacity>
        </View>
      )}
      
      {userRole === 'rider' && (
        <View style={styles.riderInfo}>
          <Text style={styles.sectionTitle}>Rider Dashboard</Text>
          <Text style={styles.infoText}>Switch to the notifications tab to see ride requests from seekers!</Text>
          <View style={styles.statsCard}>
            <Text style={styles.statNumber}>{notifications.length}</Text>
            <Text style={styles.statLabel}>Pending Requests</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );

  const renderNotifications = () => (
    <ScrollView style={styles.notificationsContainer}>
      <Text style={styles.sectionTitle}>Ride Requests ({notifications.length})</Text>
      
      {notifications.map((notification) => (
        <View key={notification.id} style={styles.notificationCard}>
          <Image source={{ uri: notification.seeker.photo }} style={styles.seekerPhoto} />
          <View style={styles.notificationInfo}>
            <Text style={styles.seekerName}>{notification.seeker.name}, {notification.seeker.age}</Text>
            <Text style={styles.requestText}>wants to join your ride</Text>
            <Text style={styles.rideRoute}>{notification.ride.pickup} → {notification.ride.destination}</Text>
            <Text style={styles.requestTime}>{notification.timestamp.toLocaleTimeString()}</Text>
          </View>
          
          <View style={styles.responseButtons}>
            <TouchableOpacity 
              style={styles.declineButton}
              onPress={() => handleRiderResponse(notification, 'decline')}
            >
              <Ionicons name="close" size={20} color={colors.background} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.acceptButton}
              onPress={() => handleRiderResponse(notification, 'accept')}
            >
              <Ionicons name="checkmark" size={20} color={colors.background} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
      
      {notifications.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No ride requests</Text>
          <Text style={styles.emptySubtext}>Seekers will send you requests when they're interested in your rides</Text>
        </View>
      )}
    </ScrollView>
  );

  const renderMatches = () => (
    <ScrollView style={styles.matchesContainer}>
      <Text style={styles.sectionTitle}>Your Matches ({matches.filter(m => m.status === 'matched').length})</Text>
      {matches.filter(m => m.status === 'matched' || m.riderAccepted).map((match, index) => (
        <View key={index} style={styles.matchCard}>
          <Image source={{ uri: match.rider.photo }} style={styles.matchPhoto} />
          <View style={styles.matchInfo}>
            <Text style={styles.matchName}>{match.rider.name}</Text>
            <Text style={styles.matchRoute}>{match.pickup} → {match.destination}</Text>
            <Text style={styles.matchTime}>{match.time}</Text>
            {match.riderAccepted && (
              <Text style={styles.matchStatus}>✅ Ride confirmed! Pickup location shared</Text>
            )}
          </View>
          <TouchableOpacity style={styles.chatButton}>
            <Ionicons name="chatbubble" size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      ))}
      {matches.filter(m => m.status === 'matched').length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={64} color={colors.textSecondary} />
          <Text style={styles.emptyText}>No confirmed matches yet</Text>
          <Text style={styles.emptySubtext}>Keep swiping to find your perfect ride!</Text>
        </View>
      )}
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {currentView === 'swipe' ? 'Discover Rides' : 
           currentView === 'home' ? 'Matches' : 'Profile'}
        </Text>
      </View>

      <View style={styles.content}>
        {currentView === 'home' && renderHome()}
        {currentView === 'swipe' && renderSwipeCard()}
        {currentView === 'matches' && (userRole === 'rider' ? renderNotifications() : renderMatches())}
        {currentView === 'profile' && renderProfile()}
      </View>

      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navButton, currentView === 'swipe' && styles.activeNavButton]}
          onPress={() => setCurrentView('swipe')}
        >
          <Ionicons 
            name="car" 
            size={24} 
            color={currentView === 'swipe' ? colors.primary : colors.textSecondary} 
          />
          <Text style={[styles.navText, currentView === 'swipe' && styles.activeNavText]}>
            Swipe
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navButton, currentView === 'matches' && styles.activeNavButton]}
          onPress={() => setCurrentView('matches')}
        >
          <Ionicons 
            name={userRole === 'rider' ? "notifications" : "heart"} 
            size={24} 
            color={currentView === 'matches' ? colors.primary : colors.textSecondary} 
          />
          {notifications.length > 0 && userRole === 'rider' && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>{notifications.length}</Text>
            </View>
          )}
          <Text style={[styles.navText, currentView === 'matches' && styles.activeNavText]}>
            {userRole === 'rider' ? 'Requests' : 'Matches'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, currentView === 'home' && styles.activeNavButton]}
          onPress={() => setCurrentView('home')}
        >
          <Ionicons 
            name="home" 
            size={24} 
            color={currentView === 'home' ? colors.primary : colors.textSecondary} 
          />
          <Text style={[styles.navText, currentView === 'home' && styles.activeNavText]}>
            Home
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navButton, currentView === 'profile' && styles.activeNavButton]}
          onPress={() => setCurrentView('profile')}
        >
          <Ionicons 
            name="person" 
            size={24} 
            color={currentView === 'profile' ? colors.primary : colors.textSecondary} 
          />
          <Text style={[styles.navText, currentView === 'profile' && styles.activeNavText]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.large,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.heading2,
    color: colors.text,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeCard: {
    width: width - 40,
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  riderPhoto: {
    width: '100%',
    height: 300,
  },
  cardContent: {
    padding: spacing.large,
  },
  riderName: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: spacing.small,
  },
  riderBio: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.large,
    lineHeight: 22,
  },
  rideDetails: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.medium,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  locationText: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.small,
  },
  rideInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.medium,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginLeft: spacing.tiny,
  },
  swipeActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: spacing.large,
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passButton: {
    backgroundColor: colors.swipePass,
  },
  likeButton: {
    backgroundColor: colors.swipeLike,
  },
  profileContainer: {
    flex: 1,
    padding: spacing.large,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.extraLarge,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: spacing.medium,
  },
  profileName: {
    ...typography.heading2,
    color: colors.text,
    marginBottom: spacing.tiny,
  },
  profileRole: {
    ...typography.body,
    color: colors.textSecondary,
  },
  profileInfo: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.medium,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.body,
    color: colors.text,
  },
  matchesContainer: {
    flex: 1,
    padding: spacing.large,
  },
  sectionTitle: {
    ...typography.heading3,
    color: colors.text,
    marginBottom: spacing.large,
  },
  matchCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.medium,
    marginBottom: spacing.medium,
    alignItems: 'center',
  },
  matchPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: spacing.medium,
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  matchRoute: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.tiny,
  },
  matchTime: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.tiny,
  },
  chatButton: {
    padding: spacing.small,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: spacing.extraLarge * 2,
  },
  emptyText: {
    ...typography.heading3,
    color: colors.text,
    marginTop: spacing.medium,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.small,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: spacing.medium,
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.small,
  },
  activeNavButton: {
    // Additional styling for active state if needed
  },
  navText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.tiny,
  },
  activeNavText: {
    color: colors.primary,
  },
  // New styles for enhanced demo
  homeContainer: {
    flex: 1,
    padding: spacing.large,
  },
  roleSelector: {
    marginBottom: spacing.extraLarge,
  },
  welcomeText: {
    ...typography.heading2,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.small,
  },
  roleQuestion: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.large,
  },
  roleButtons: {
    flexDirection: 'row',
    gap: spacing.medium,
  },
  roleButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.large,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.border,
  },
  activeRoleButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleButtonText: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginTop: spacing.small,
  },
  activeRoleButtonText: {
    color: colors.background,
  },
  roleDescription: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.tiny,
  },
  activeRoleDescription: {
    color: colors.background,
  },
  locationInputs: {
    marginBottom: spacing.extraLarge,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.medium,
    marginBottom: spacing.medium,
  },
  locationInput: {
    flex: 1,
    marginLeft: spacing.small,
    ...typography.body,
    color: colors.text,
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: spacing.medium,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    ...typography.body,
    color: colors.background,
    fontWeight: '600',
    marginRight: spacing.small,
  },
  riderInfo: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.large,
    alignItems: 'center',
  },
  infoText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.large,
  },
  statsCard: {
    alignItems: 'center',
  },
  statNumber: {
    ...typography.heading1,
    color: colors.primary,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  notificationsContainer: {
    flex: 1,
    padding: spacing.large,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.medium,
    marginBottom: spacing.medium,
    alignItems: 'center',
  },
  seekerPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: spacing.medium,
  },
  notificationInfo: {
    flex: 1,
  },
  seekerName: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
  },
  requestText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.tiny,
  },
  rideRoute: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.tiny,
  },
  requestTime: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.tiny,
  },
  responseButtons: {
    flexDirection: 'row',
    gap: spacing.small,
  },
  acceptButton: {
    backgroundColor: colors.success,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  declineButton: {
    backgroundColor: colors.error,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchStatus: {
    ...typography.caption,
    color: colors.success,
    marginTop: spacing.tiny,
    fontWeight: '600',
  },
  notificationBadge: {
    position: 'absolute',
    top: -5,
    right: 8,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    ...typography.caption,
    color: colors.background,
    fontSize: 12,
    fontWeight: '600',
  },
});