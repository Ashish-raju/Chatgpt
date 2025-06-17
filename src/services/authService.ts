import {
  signInWithPhoneNumber,
  PhoneAuthProvider,
  signInWithCredential,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../config/firebase';

class AuthService {
  /**
   * Sign in with phone number using Firebase Auth
   */
  async signInWithPhoneNumber(phoneNumber: string): Promise<string> {
    try {
      // Note: In a real app, you would need to set up reCAPTCHA for web
      // or use the actual device for mobile. For this implementation,
      // we'll simulate the verification ID
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber);
      return confirmation.verificationId;
    } catch (error: any) {
      console.error('Phone sign in error:', error);
      throw new Error(error.message || 'Failed to send verification code');
    }
  }

  /**
   * Verify phone number with the verification code
   */
  async verifyPhoneNumber(verificationId: string, verificationCode: string): Promise<boolean> {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
      const result = await signInWithCredential(auth, credential);
      return !!result.user;
    } catch (error: any) {
      console.error('Phone verification error:', error);
      throw new Error(error.message || 'Invalid verification code');
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw new Error(error.message || 'Failed to sign out');
    }
  }

  /**
   * Get the current authenticated user
   */
  async getCurrentUser(): Promise<FirebaseUser | null> {
    return auth.currentUser;
  }

  /**
   * Listen for authentication state changes
   */
  onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  /**
   * Get the current user's ID token
   */
  async getIdToken(): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) {
      return null;
    }

    try {
      return await user.getIdToken();
    } catch (error) {
      console.error('Error getting ID token:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!auth.currentUser;
  }
}

export const authService = new AuthService();
