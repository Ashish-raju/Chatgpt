// Demo configuration for showcasing app functionality
export const DEMO_MODE = true;

export const DEMO_USER = {
  id: 'demo-user-123',
  phoneNumber: '+1234567890',
  role: 'seeker' as const,
  kycStatus: 'verified' as const,
  profile: {
    name: 'Alex Johnson',
    age: 28,
    bio: 'Love traveling and meeting new people! Always up for interesting conversations and discovering new places around the city.',
    photos: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1494790108755-2616b612b977?w=400&h=400&fit=crop&crop=face'
    ],
    hobbies: ['Travel', 'Photography', 'Coffee', 'Music'],
    interests: ['Adventure', 'Art'],
    habits: ['Early Riser', 'Non-Smoker'],
    personalityTraits: ['Outgoing', 'Creative', 'Adventurous']
  },
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-20')
};

export const DEMO_RIDER = {
  id: 'demo-rider-456',
  phoneNumber: '+1987654321',
  role: 'rider' as const,
  kycStatus: 'verified' as const,
  profile: {
    name: 'Sarah Chen',
    age: 26,
    bio: 'Professional photographer who loves road trips. I enjoy meeting creative people and sharing stories during rides.',
    photos: [
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face'
    ],
    hobbies: ['Photography', 'Road Trips', 'Design', 'Nature'],
    interests: ['Art', 'Adventure'],
    habits: ['Non-Smoker', 'Music Lover'],
    personalityTraits: ['Creative', 'Friendly', 'Reliable']
  },
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-18')
};

export const DEMO_RIDES = [
  {
    id: 'ride-1',
    riderId: 'demo-rider-456',
    riderProfile: DEMO_RIDER.profile,
    startLocation: {
      latitude: 37.7749,
      longitude: -122.4194,
      address: 'Downtown San Francisco, CA'
    },
    endLocation: {
      latitude: 37.8044,
      longitude: -122.2712,
      address: 'Berkeley, CA'
    },
    status: 'available' as const,
    createdAt: new Date('2024-01-20T10:00:00Z'),
    updatedAt: new Date('2024-01-20T10:00:00Z')
  },
  {
    id: 'ride-2',
    riderId: 'demo-rider-789',
    riderProfile: {
      name: 'Mike Rodriguez',
      age: 32,
      bio: 'Tech entrepreneur who loves podcasts and deep conversations.',
      photos: [
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face'
      ],
      hobbies: ['Tech', 'Podcasts', 'Running'],
      interests: ['Business', 'Innovation'],
      habits: ['Early Riser', 'Fitness Enthusiast'],
      personalityTraits: ['Ambitious', 'Analytical', 'Sociable']
    },
    startLocation: {
      latitude: 37.7849,
      longitude: -122.4094,
      address: 'Financial District, San Francisco, CA'
    },
    endLocation: {
      latitude: 37.4419,
      longitude: -122.1430,
      address: 'Palo Alto, CA'
    },
    status: 'available' as const,
    createdAt: new Date('2024-01-20T14:30:00Z'),
    updatedAt: new Date('2024-01-20T14:30:00Z')
  },
  {
    id: 'ride-3',
    riderId: 'demo-rider-101',
    riderProfile: {
      name: 'Emma Wilson',
      age: 24,
      bio: 'Art student exploring the city. Love meeting fellow creatives!',
      photos: [
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop&crop=face'
      ],
      hobbies: ['Art', 'Museums', 'Yoga'],
      interests: ['Culture', 'Creativity'],
      habits: ['Mindful', 'Coffee Lover'],
      personalityTraits: ['Artistic', 'Open-minded', 'Calm']
    },
    startLocation: {
      latitude: 37.7649,
      longitude: -122.4394,
      address: 'Mission District, San Francisco, CA'
    },
    endLocation: {
      latitude: 37.8199,
      longitude: -122.4783,
      address: 'Golden Gate Park, San Francisco, CA'
    },
    status: 'available' as const,
    createdAt: new Date('2024-01-20T16:00:00Z'),
    updatedAt: new Date('2024-01-20T16:00:00Z')
  }
];

export const DEMO_MATCHES = [
  {
    id: 'match-1',
    rideId: 'ride-1',
    riderId: 'demo-rider-456',
    seekerId: 'demo-user-123',
    status: 'active' as const,
    createdAt: new Date('2024-01-20T11:00:00Z'),
    riderProfile: DEMO_RIDER.profile,
    seekerProfile: DEMO_USER.profile
  }
];