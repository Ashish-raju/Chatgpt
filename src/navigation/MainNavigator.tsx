import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

// Rider Screens
import RiderHomeScreen from '../screens/rider/RiderHomeScreen';
import CreateRideScreen from '../screens/rider/CreateRideScreen';
import RideManagementScreen from '../screens/rider/RideManagementScreen';

// Seeker Screens
import SeekerHomeScreen from '../screens/seeker/SeekerHomeScreen';
import SwipeScreen from '../screens/seeker/SwipeScreen';
import RideDetailsScreen from '../screens/seeker/RideDetailsScreen';

// Shared Screens
import ProfileScreen from '../screens/profile/ProfileScreen';
import RideHistoryScreen from '../screens/shared/RideHistoryScreen';
import MatchesScreen from '../screens/shared/MatchesScreen';
import RideStatusScreen from '../screens/shared/RideStatusScreen';
import RatingScreen from '../screens/shared/RatingScreen';
import PaymentScreen from '../screens/shared/PaymentScreen';

export type MainTabParamList = {
  Home: undefined;
  Swipe?: undefined;
  Matches: undefined;
  Profile: undefined;
};

export type MainStackParamList = {
  MainTabs: undefined;
  CreateRide: undefined;
  RideManagement: {
    rideId: string;
  };
  RideDetails: {
    rideId: string;
  };
  RideHistory: undefined;
  RideStatus: {
    matchId: string;
  };
  Rating: {
    matchId: string;
    isRider: boolean;
  };
  Payment: {
    matchId: string;
    amount: number;
  };
};

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createStackNavigator<MainStackParamList>();

const MainTabs: React.FC = () => {
  const { user } = useAuth();
  const isRider = user?.role === 'rider';

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Swipe') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Matches') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'ellipse-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#E5E5EA',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={isRider ? RiderHomeScreen : SeekerHomeScreen}
        options={{ 
          title: isRider ? 'My Rides' : 'Find Rides',
          headerShown: false,
        }}
      />
      {!isRider && (
        <Tab.Screen 
          name="Swipe" 
          component={SwipeScreen}
          options={{ 
            title: 'Discover',
            headerShown: false,
          }}
        />
      )}
      <Tab.Screen 
        name="Matches" 
        component={MatchesScreen}
        options={{ 
          title: 'Matches',
          headerShown: false,
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ 
          title: 'Profile',
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#333333',
      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="CreateRide" 
        component={CreateRideScreen}
        options={{ title: 'Create Ride' }}
      />
      <Stack.Screen 
        name="RideManagement" 
        component={RideManagementScreen}
        options={{ title: 'Manage Ride' }}
      />
      <Stack.Screen 
        name="RideDetails" 
        component={RideDetailsScreen}
        options={{ title: 'Ride Details' }}
      />
      <Stack.Screen 
        name="RideHistory" 
        component={RideHistoryScreen}
        options={{ title: 'Ride History' }}
      />
      <Stack.Screen 
        name="RideStatus" 
        component={RideStatusScreen}
        options={{ title: 'Ride Status' }}
      />
      <Stack.Screen 
        name="Rating" 
        component={RatingScreen}
        options={{ title: 'Rate Experience' }}
      />
      <Stack.Screen 
        name="Payment" 
        component={PaymentScreen}
        options={{ title: 'Payment' }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;
