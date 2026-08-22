import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User as FirebaseUser,
  signOut as firebaseSignOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.email',
  'https://www.googleapis.com/auth/userinfo.profile'
];

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
SCOPES.forEach(scope => googleProvider.addScope(scope));
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Cache the access token in memory (never localStorage per security guidelines)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export interface AppUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  photoURL?: string;
  provider: 'google' | 'phone';
  googleEmail?: string;
  lastLoginAt: string;
}

const USER_SESSION_KEY = 'erikhub_user_session_v1';

export const getCachedAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const getStoredUserSession = (): AppUser | null => {
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to read user session', e);
  }
  return null;
};

export const saveStoredUserSession = (user: AppUser | null) => {
  try {
    if (user) {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_SESSION_KEY);
    }
  } catch (e) {
    console.error('Failed to save user session', e);
  }
};

/**
 * Sign in with Google using Firebase Auth popup with drive.file scopes
 */
export const signInWithGoogle = async (): Promise<{ user: AppUser; accessToken: string }> => {
  isSigningIn = true;
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const accessToken = credential?.accessToken;

    if (!accessToken) {
      throw new Error('Could not obtain Google Drive OAuth access token.');
    }

    cachedAccessToken = accessToken;

    const fbUser = result.user;
    const appUser: AppUser = {
      id: fbUser.uid,
      name: fbUser.displayName || 'Google User',
      email: fbUser.email || undefined,
      phone: fbUser.phoneNumber || undefined,
      photoURL: fbUser.photoURL || undefined,
      provider: 'google',
      googleEmail: fbUser.email || undefined,
      lastLoginAt: new Date().toISOString()
    };

    saveStoredUserSession(appUser);
    return { user: appUser, accessToken };
  } catch (error: any) {
    console.error('Google Sign-In error details:', error);
    
    // Check for Google OAuth verification / testing mode error 403 access_denied
    const errorStr = (error?.message || '') + ' ' + (error?.code || '');
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request'
    ) {
      throw new Error('Sign-in popup was closed before completing.');
    } else if (
      errorStr.includes('access_denied') || 
      errorStr.includes('verification process') ||
      errorStr.includes('developer-approved testers') ||
      error?.code === 'auth/unauthorized-domain'
    ) {
      throw new Error(
        'Google OAuth 403 (App Under Testing): Your Google account is not yet added to the developer test users list, or OAuth consent is in Testing mode. You can sign in instantly using the "Phone Number" tab (with demo OTP 123456) or add your email as a Test User in Google Cloud Console > OAuth consent screen.'
      );
    }
    
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Sign out and clear cached token and session
 */
export const logoutAuth = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (e) {
    console.warn('Firebase signout warning:', e);
  }
  cachedAccessToken = null;
  saveStoredUserSession(null);
};

/**
 * Initialize Firebase Auth listener
 */
export const initAuthListener = (
  onSuccess: (user: FirebaseUser, token: string | null) => void,
  onSignedOut: () => void
) => {
  return onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      onSuccess(firebaseUser, cachedAccessToken);
    } else {
      if (!isSigningIn) {
        onSignedOut();
      }
    }
  });
};
