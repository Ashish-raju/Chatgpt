import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { DEMO_MODE, DEMO_USER } from '../config/demo';

interface AuthContextType extends AuthState {
  signInWithPhoneNumber: (phoneNumber: string) => Promise<string>;
  verifyPhoneNumber: (verificationId: string, code: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  updateUserProfile: (profile: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    if (DEMO_MODE) {
      // Demo mode - simulate authentication
      setTimeout(() => {
        setAuthState({
          user: DEMO_USER,
          isLoading: false,
          isAuthenticated: true,
        });
      }, 1000);
      return;
    }

    // Real Firebase implementation would go here
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  }, []);

  const signInWithPhoneNumber = async (phoneNumber: string): Promise<string> => {
    if (DEMO_MODE) {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      setTimeout(() => {
        setAuthState({
          user: DEMO_USER,
          isLoading: false,
          isAuthenticated: true,
        });
      }, 1500);
      return 'demo-verification-id';
    }
    throw new Error('Firebase not configured');
  };

  const verifyPhoneNumber = async (verificationId: string, code: string): Promise<boolean> => {
    if (DEMO_MODE) {
      setAuthState({
        user: DEMO_USER,
        isLoading: false,
        isAuthenticated: true,
      });
      return true;
    }
    throw new Error('Firebase not configured');
  };

  const signOut = async (): Promise<void> => {
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  const updateUserProfile = async (profile: Partial<User>): Promise<void> => {
    if (!authState.user) {
      throw new Error('No authenticated user');
    }

    if (DEMO_MODE) {
      const updatedUser = { ...authState.user, ...profile };
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
      return;
    }
    throw new Error('Firebase not configured');
  };

  const refreshUser = async (): Promise<void> => {
    if (DEMO_MODE && authState.user) {
      // In demo mode, just keep current user
      return;
    }
  };

  const value: AuthContextType = {
    ...authState,
    signInWithPhoneNumber,
    verifyPhoneNumber,
    signOut,
    updateUserProfile,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
