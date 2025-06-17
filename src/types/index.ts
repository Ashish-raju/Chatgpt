export interface User {
  id: string;
  phoneNumber: string;
  role: 'rider' | 'seeker';
  profile: UserProfile;
  kycStatus?: 'pending' | 'verified' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  name: string;
  age: number;
  bio: string;
  photos: string[];
  hobbies: string[];
  habits: string[];
  personalityTraits: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface Ride {
  id: string;
  riderId: string;
  riderProfile: UserProfile;
  startLocation: Location;
  endLocation?: Location;
  status: 'available' | 'matched' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  seekerId?: string;
  matchId?: string;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
  name?: string;
}

export interface Match {
  id: string;
  rideId: string;
  riderId: string;
  seekerId: string;
  status: 'pending' | 'confirmed' | 'completed';
  riderRating?: Rating;
  seekerRating?: Rating;
  paymentRequired: boolean;
  paymentAmount?: number;
  paymentStatus?: 'pending' | 'completed' | 'waived';
  createdAt: Date;
  updatedAt: Date;
}

export interface Rating {
  type: 'date' | 'ride';
  rating: number;
  comment?: string;
}

export interface Payment {
  id: string;
  matchId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  stripePaymentIntentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KYCDocument {
  id: string;
  userId: string;
  type: 'passport' | 'drivers_license' | 'national_id';
  documentUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: Date;
  verifiedAt?: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LocationState {
  currentLocation: Location | null;
  isLoading: boolean;
  hasPermission: boolean;
  nearbyRides: Ride[];
}

export interface SwipeAction {
  type: 'like' | 'pass';
  userId: string;
  rideId: string;
}

export interface NavigationProps {
  navigation: any;
  route: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
