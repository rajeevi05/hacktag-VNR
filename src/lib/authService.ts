import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  sendEmailVerification,
  reload,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
  User,
  UserCredential,
} from "firebase/auth";
import { auth } from "./firebase";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  hasOnboarded: boolean;
}

export class AuthService {
  private static googleProvider = new GoogleAuthProvider();

  // ✅ Email/Password Signup
  static async signup(email: string, password: string): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(userCredential.user);
    return userCredential;
  }

  // ✅ Email/Password Login
  static async login(email: string, password: string): Promise<UserCredential> {
    return await signInWithEmailAndPassword(auth, email, password);
  }

  // ✅ Google Sign-in
  static async signInWithGoogle(): Promise<void> {
    try {
      await signInWithRedirect(auth, this.googleProvider);
    } catch (error: any) {
      throw new Error(this.getErrorMessage(error.code));
    }
  }

  // ✅ Handle Redirect Result (call in App.tsx on mount)
  static async handleRedirectResult(): Promise<UserCredential | null> {
    return await getRedirectResult(auth);
  }

  // ✅ Resend verification email
  static async resendVerification(): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is currently signed in.");
    await sendEmailVerification(user);
  }

  // ✅ Reload user and return updated
  static async reloadUser(): Promise<User | null> {
    const user = auth.currentUser;
    if (!user) return null;
    await reload(user);
    return auth.currentUser;
  }

  // ✅ Password reset
  static async resetPassword(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email);
  }

  // ✅ Sign out
  static async logout(): Promise<void> {
    await signOut(auth);
  }

  // ✅ Listen to auth state changes
  static onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // ✅ Get current user
  static getCurrentUser(): User | null {
    return auth.currentUser;
  }

  // ✅ Friendlier error messages
  private static getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case "auth/email-already-in-use":
        return "Email already registered. Please sign in instead.";
      case "auth/invalid-email":
        return "Invalid email address.";
      case "auth/weak-password":
        return "Password should be at least 6 characters.";
      case "auth/user-not-found":
        return "No account found with this email.";
      case "auth/wrong-password":
        return "Incorrect password.";
      case "auth/too-many-requests":
        return "Too many failed attempts. Please try again later.";
      case "auth/popup-closed-by-user":
        return "Sign-in popup was closed before finishing.";
      case "auth/cancelled-popup-request":
        return "Cancelled another popup sign-in attempt.";
      case "auth/popup-blocked":
        return "Popup was blocked by the browser. Redirecting instead.";
      default:
        return "Authentication failed. Please try again.";
    }
  }
}
