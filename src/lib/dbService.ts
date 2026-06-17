import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from './firebase';

export interface UserDocument {
  uid: string;
  email: string;
  displayName: string | null;
  hasOnboarded: boolean;
  createdAt: Timestamp;
  businessProfile?: Record<string, any>;
}

export class DbService {
  private static localUserKey(uid: string): string {
    return `boostly:user:${uid}`;
  }

  private static readLocalUser(uid: string): UserDocument | null {
    const rawUser = localStorage.getItem(this.localUserKey(uid));
    if (rawUser) return JSON.parse(rawUser) as UserDocument;

    const onboardingData = localStorage.getItem("onboardingData");
    const userData = localStorage.getItem("user");

    if (!onboardingData || !userData) return null;

    const user = JSON.parse(userData);
    return {
      uid,
      email: user.email || "",
      displayName: user.name || null,
      hasOnboarded: true,
      createdAt: Timestamp.now(),
      businessProfile: JSON.parse(onboardingData),
    };
  }

  private static writeLocalUser(user: UserDocument): void {
    localStorage.setItem(this.localUserKey(user.uid), JSON.stringify(user));
  }

  private static isRecoverableFirestoreError(error: any): boolean {
    const message = String(error?.message || "").toLowerCase();
    return (
      message.includes("client is offline") ||
      message.includes("offline") ||
      message.includes("missing or insufficient permissions") ||
      error?.code === "unavailable" ||
      error?.code === "permission-denied"
    );
  }

  // Save onboarding data
  static async saveOnboarding(uid: string, businessProfile: Record<string, any>): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        hasOnboarded: true,
        businessProfile,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error: any) {
      if (this.isRecoverableFirestoreError(error)) {
        const existing = this.readLocalUser(uid);
        this.writeLocalUser({
          uid,
          email: existing?.email || "",
          displayName: existing?.displayName || null,
          hasOnboarded: true,
          createdAt: existing?.createdAt || Timestamp.now(),
          businessProfile,
        });
        console.warn("Firestore is unavailable or denied access. Saved onboarding profile locally instead.", error);
        return;
      }
      throw new Error(`Failed to save onboarding: ${error.message}`);
    }
  }

  // Get user document
  static async getUser(uid: string): Promise<UserDocument | null> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        return null;
      }
      
      return userSnap.data() as UserDocument;
    } catch (error: any) {
      if (this.isRecoverableFirestoreError(error)) {
        console.warn("Firestore is unavailable or denied access. Reading user profile from local storage instead.", error);
        return this.readLocalUser(uid);
      }
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  // Create user document on first signup
  static async createUserDocument(uid: string, email: string, displayName: string | null): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await setDoc(userRef, {
        uid,
        email,
        displayName,
        hasOnboarded: false,
        createdAt: serverTimestamp()
      });
    } catch (error: any) {
      if (this.isRecoverableFirestoreError(error)) {
        this.writeLocalUser({
          uid,
          email,
          displayName,
          hasOnboarded: false,
          createdAt: Timestamp.now(),
        });
        console.warn("Firestore is unavailable or denied access. Created user profile locally instead.", error);
        return;
      }
      throw new Error(`Failed to create user document: ${error.message}`);
    }
  }

  // Update user document
  static async updateUser(uid: string, updates: Partial<UserDocument>): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error: any) {
      if (this.isRecoverableFirestoreError(error)) {
        const existing = this.readLocalUser(uid);
        if (existing) {
          this.writeLocalUser({ ...existing, ...updates });
          console.warn("Firestore is unavailable or denied access. Updated user profile locally instead.", error);
          return;
        }
      }
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }
}
