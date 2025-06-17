import { UserProfile } from '../types';
import { APP_CONSTANTS, PHONE_REGEX, EMAIL_REGEX } from './constants';

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  if (!phoneNumber || phoneNumber.trim().length === 0) {
    return false;
  }
  
  // Remove spaces and special characters except +
  const cleanedNumber = phoneNumber.replace(/[\s\-\(\)]/g, '');
  
  return PHONE_REGEX.test(cleanedNumber) && cleanedNumber.length >= 10;
};

export const validateEmail = (email: string): boolean => {
  return EMAIL_REGEX.test(email.toLowerCase());
};

export const validateName = (name: string): string | null => {
  if (!name || name.trim().length === 0) {
    return 'Name is required';
  }
  
  const trimmedName = name.trim();
  
  if (trimmedName.length < APP_CONSTANTS.MIN_NAME_LENGTH) {
    return `Name must be at least ${APP_CONSTANTS.MIN_NAME_LENGTH} characters`;
  }
  
  if (trimmedName.length > APP_CONSTANTS.MAX_NAME_LENGTH) {
    return `Name cannot exceed ${APP_CONSTANTS.MAX_NAME_LENGTH} characters`;
  }
  
  // Check for valid characters (letters, spaces, apostrophes, hyphens)
  const nameRegex = /^[a-zA-Z\s'\-]+$/;
  if (!nameRegex.test(trimmedName)) {
    return 'Name can only contain letters, spaces, apostrophes, and hyphens';
  }
  
  return null;
};

export const validateAge = (age: string | number): string | null => {
  const ageNum = typeof age === 'string' ? parseInt(age, 10) : age;
  
  if (isNaN(ageNum)) {
    return 'Age must be a valid number';
  }
  
  if (ageNum < APP_CONSTANTS.MIN_AGE) {
    return `You must be at least ${APP_CONSTANTS.MIN_AGE} years old`;
  }
  
  if (ageNum > APP_CONSTANTS.MAX_AGE) {
    return `Age cannot exceed ${APP_CONSTANTS.MAX_AGE}`;
  }
  
  return null;
};

export const validateBio = (bio: string): string | null => {
  if (!bio || bio.trim().length === 0) {
    return 'Bio is required';
  }
  
  const trimmedBio = bio.trim();
  
  if (trimmedBio.length < APP_CONSTANTS.MIN_BIO_LENGTH) {
    return `Bio must be at least ${APP_CONSTANTS.MIN_BIO_LENGTH} characters`;
  }
  
  if (trimmedBio.length > APP_CONSTANTS.MAX_BIO_LENGTH) {
    return `Bio cannot exceed ${APP_CONSTANTS.MAX_BIO_LENGTH} characters`;
  }
  
  return null;
};

export const validatePhotos = (photos: string[]): string | null => {
  if (!photos || photos.length === 0) {
    return 'At least one photo is required';
  }
  
  if (photos.length > APP_CONSTANTS.MAX_PHOTOS) {
    return `Maximum ${APP_CONSTANTS.MAX_PHOTOS} photos allowed`;
  }
  
  return null;
};

export const validateProfile = (profile: Partial<UserProfile>): string | null => {
  // Validate name
  const nameError = validateName(profile.name || '');
  if (nameError) return nameError;
  
  // Validate age
  const ageError = validateAge(profile.age || '');
  if (ageError) return ageError;
  
  // Validate bio
  const bioError = validateBio(profile.bio || '');
  if (bioError) return bioError;
  
  // Validate photos
  const photosError = validatePhotos(profile.photos || []);
  if (photosError) return photosError;
  
  return null;
};

export const validateVerificationCode = (code: string): boolean => {
  if (!code || code.trim().length === 0) {
    return false;
  }
  
  // Remove any spaces or special characters
  const cleanedCode = code.replace(/\s/g, '');
  
  // Check if it's exactly 6 digits
  return /^\d{6}$/.test(cleanedCode);
};

export const validateLocationCoordinates = (latitude: number, longitude: number): boolean => {
  return (
    latitude >= -90 && 
    latitude <= 90 && 
    longitude >= -180 && 
    longitude <= 180
  );
};

export const validatePaymentAmount = (amount: number): string | null => {
  if (isNaN(amount) || amount <= 0) {
    return 'Invalid payment amount';
  }
  
  if (amount < APP_CONSTANTS.MIN_PAYMENT_AMOUNT) {
    return `Minimum payment amount is $${APP_CONSTANTS.MIN_PAYMENT_AMOUNT / 100}`;
  }
  
  if (amount > APP_CONSTANTS.MAX_PAYMENT_AMOUNT) {
    return `Maximum payment amount is $${APP_CONSTANTS.MAX_PAYMENT_AMOUNT / 100}`;
  }
  
  return null;
};

export const validateDistance = (distance: number): string | null => {
  if (isNaN(distance) || distance <= 0) {
    return 'Invalid distance';
  }
  
  if (distance < APP_CONSTANTS.MIN_RIDE_DISTANCE) {
    return `Minimum ride distance is ${APP_CONSTANTS.MIN_RIDE_DISTANCE / 1000}km`;
  }
  
  if (distance > APP_CONSTANTS.MAX_RIDE_DISTANCE) {
    return `Maximum ride distance is ${APP_CONSTANTS.MAX_RIDE_DISTANCE / 1000}km`;
  }
  
  return null;
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  
  return phoneNumber;
};
