import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, UserProfile, KYCDocument } from '../types';

class UserService {
  private readonly usersCollection = 'users';
  private readonly kycCollection = 'kyc_documents';

  /**
   * Create a new user profile
   */
  async createUser(
    userId: string,
    phoneNumber: string,
    role: 'rider' | 'seeker',
    profile: UserProfile
  ): Promise<User> {
    try {
      const user: User = {
        id: userId,
        phoneNumber,
        role,
        profile,
        kycStatus: role === 'rider' ? 'pending' : undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, this.usersCollection, userId), {
        ...user,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return user;
    } catch (error: any) {
      console.error('Error creating user:', error);
      throw new Error(error.message || 'Failed to create user');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, this.usersCollection, userId));
      
      if (!userDoc.exists()) {
        return null;
      }

      const userData = userDoc.data();
      return {
        ...userData,
        id: userDoc.id,
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate() || new Date(),
      } as User;
    } catch (error: any) {
      console.error('Error getting user:', error);
      throw new Error(error.message || 'Failed to get user');
    }
  }

  /**
   * Update user profile
   */
  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const userRef = doc(db, this.usersCollection, userId);
      
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });

      const updatedUser = await this.getUserById(userId);
      if (!updatedUser) {
        throw new Error('User not found after update');
      }

      return updatedUser;
    } catch (error: any) {
      console.error('Error updating user:', error);
      throw new Error(error.message || 'Failed to update user');
    }
  }

  /**
   * Update user profile information
   */
  async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<User> {
    try {
      const currentUser = await this.getUserById(userId);
      if (!currentUser) {
        throw new Error('User not found');
      }

      const updatedProfile = {
        ...currentUser.profile,
        ...profile,
      };

      return await this.updateUser(userId, { profile: updatedProfile });
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      throw new Error(error.message || 'Failed to update profile');
    }
  }

  /**
   * Upload KYC document
   */
  async uploadKYCDocument(
    userId: string,
    documentType: 'passport' | 'drivers_license' | 'national_id',
    documentUrl: string
  ): Promise<KYCDocument> {
    try {
      const kycDoc: KYCDocument = {
        id: `${userId}_${documentType}_${Date.now()}`,
        userId,
        type: documentType,
        documentUrl,
        status: 'pending',
        uploadedAt: new Date(),
      };

      await setDoc(doc(db, this.kycCollection, kycDoc.id), {
        ...kycDoc,
        uploadedAt: serverTimestamp(),
      });

      // Update user KYC status
      await this.updateUser(userId, { kycStatus: 'pending' });

      return kycDoc;
    } catch (error: any) {
      console.error('Error uploading KYC document:', error);
      throw new Error(error.message || 'Failed to upload KYC document');
    }
  }

  /**
   * Get KYC documents for user
   */
  async getKYCDocuments(userId: string): Promise<KYCDocument[]> {
    try {
      const q = query(
        collection(db, this.kycCollection),
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const documents: KYCDocument[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        documents.push({
          ...data,
          id: doc.id,
          uploadedAt: data.uploadedAt?.toDate() || new Date(),
          verifiedAt: data.verifiedAt?.toDate(),
        } as KYCDocument);
      });

      return documents;
    } catch (error: any) {
      console.error('Error getting KYC documents:', error);
      throw new Error(error.message || 'Failed to get KYC documents');
    }
  }

  /**
   * Check if user exists by phone number
   */
  async getUserByPhoneNumber(phoneNumber: string): Promise<User | null> {
    try {
      const q = query(
        collection(db, this.usersCollection),
        where('phoneNumber', '==', phoneNumber)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();
      
      return {
        ...userData,
        id: userDoc.id,
        createdAt: userData.createdAt?.toDate() || new Date(),
        updatedAt: userData.updatedAt?.toDate() || new Date(),
      } as User;
    } catch (error: any) {
      console.error('Error getting user by phone:', error);
      throw new Error(error.message || 'Failed to get user by phone number');
    }
  }

  /**
   * Check if user profile is complete
   */
  isProfileComplete(user: User): boolean {
    const { profile } = user;
    return !!(
      profile.name &&
      profile.age &&
      profile.bio &&
      profile.photos.length > 0 &&
      (user.role === 'seeker' || user.kycStatus === 'verified')
    );
  }
}

export const userService = new UserService();
