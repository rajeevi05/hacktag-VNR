import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { AuthService } from '@/lib/authService';
import { DbService, UserDocument } from '@/lib/dbService';

export interface AuthState {
  user: User | null;
  userDoc: UserDocument | null;
  loading: boolean;
  emailVerified: boolean;
  hasOnboarded: boolean;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [localHasOnboarded, setLocalHasOnboarded] = useState(() => {
    return Boolean(localStorage.getItem("onboardingData"));
  });

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChange(async (user) => {
      setUser(user);
      setLoading(false);
      
      if (user) {
        // Get user document from Firestore
        try {
          const doc = await DbService.getUser(user.uid);
          setUserDoc(doc);
          setLocalHasOnboarded(Boolean(doc?.hasOnboarded || localStorage.getItem("onboardingData")));
        } catch (error) {
          console.warn('Using local auth state because the Firestore user document could not be loaded:', error);
          setUserDoc(null);
          setLocalHasOnboarded(Boolean(localStorage.getItem("onboardingData")));
        }
      } else {
        setUserDoc(null);
        setLocalHasOnboarded(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const emailVerified = user?.emailVerified || false;
  const hasOnboarded = Boolean(userDoc?.hasOnboarded || localHasOnboarded);

  return {
    user,
    userDoc,
    loading,
    emailVerified,
    hasOnboarded
  };
}
