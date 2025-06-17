export const APP_CONSTANTS = {
  APP_NAME: 'Rider-Seeker',
  VERSION: '1.0.0',
  
  // Validation constants
  MIN_AGE: 18,
  MAX_AGE: 100,
  MIN_NAME_LENGTH: 2,
  MAX_NAME_LENGTH: 50,
  MIN_BIO_LENGTH: 10,
  MAX_BIO_LENGTH: 500,
  MAX_PHOTOS: 5,
  MAX_FILE_SIZE_MB: 10,
  
  // Location constants
  DEFAULT_LOCATION_RADIUS: 5000, // 5km in meters
  MIN_LOCATION_RADIUS: 1000, // 1km
  MAX_LOCATION_RADIUS: 50000, // 50km
  
  // Ride constants
  MIN_RIDE_DISTANCE: 1000, // 1km
  MAX_RIDE_DISTANCE: 100000, // 100km
  RIDE_STATUS_UPDATE_INTERVAL: 30000, // 30 seconds
  
  // Payment constants
  MIN_PAYMENT_AMOUNT: 500, // $5.00 in cents
  MAX_PAYMENT_AMOUNT: 10000, // $100.00 in cents
  DEFAULT_PAYMENT_AMOUNT: 1500, // $15.00 in cents
  PROCESSING_FEE: 30, // $0.30 in cents
  
  // Animation durations
  ANIMATION_DURATION_SHORT: 200,
  ANIMATION_DURATION_MEDIUM: 300,
  ANIMATION_DURATION_LONG: 500,
  
  // Network timeouts
  NETWORK_TIMEOUT: 10000, // 10 seconds
  API_RETRY_ATTEMPTS: 3,
  
  // Cache constants
  CACHE_DURATION: 300000, // 5 minutes
  MAX_CACHE_SIZE: 100,
  
  // Security constants
  SESSION_TIMEOUT: 3600000, // 1 hour
  MAX_LOGIN_ATTEMPTS: 5,
  
  // Feature flags
  ENABLE_PUSH_NOTIFICATIONS: true,
  ENABLE_ANALYTICS: true,
  ENABLE_CRASH_REPORTING: true,
};

export const PHONE_REGEX = /^[\+]?[1-9][\d]{0,15}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  PERMISSION_DENIED: 'Permission denied. Please grant the required permissions.',
  LOCATION_UNAVAILABLE: 'Location services are not available.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'Invalid file type. Please select a valid image.',
  USER_NOT_FOUND: 'User not found.',
  RIDE_NOT_FOUND: 'Ride not found.',
  MATCH_NOT_FOUND: 'Match not found.',
  PAYMENT_FAILED: 'Payment processing failed.',
  KYC_REQUIRED: 'Identity verification is required to proceed.',
  PROFILE_INCOMPLETE: 'Please complete your profile before continuing.',
};

export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully.',
  RIDE_CREATED: 'Ride created successfully.',
  RIDE_UPDATED: 'Ride updated successfully.',
  MATCH_CREATED: 'It\'s a match! You can now contact each other.',
  PAYMENT_COMPLETED: 'Payment completed successfully.',
  KYC_SUBMITTED: 'Identity verification submitted for review.',
  MESSAGE_SENT: 'Message sent successfully.',
};

export const STORAGE_KEYS = {
  USER_TOKEN: '@user_token',
  USER_DATA: '@user_data',
  LAST_LOCATION: '@last_location',
  SEARCH_RADIUS: '@search_radius',
  ONBOARDING_COMPLETED: '@onboarding_completed',
  NOTIFICATION_SETTINGS: '@notification_settings',
};
