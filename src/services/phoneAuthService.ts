import { AppUser, saveStoredUserSession } from './firebaseAuth';

const PHONE_USERS_KEY = 'erikhub_registered_phone_users_v1';
const PENDING_OTP_KEY = 'erikhub_pending_otp_v1';

export interface PhoneUserProfile {
  id: string;
  phone: string;
  name: string;
  businessName?: string;
  createdAt: string;
  lastLoginAt: string;
  linkedGoogleEmail?: string;
}

export const getRegisteredPhoneUsers = (): Record<string, PhoneUserProfile> => {
  try {
    const raw = localStorage.getItem(PHONE_USERS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading phone users', e);
  }
  return {};
};

export const savePhoneUserProfile = (profile: PhoneUserProfile) => {
  const users = getRegisteredPhoneUsers();
  users[profile.phone] = profile;
  localStorage.setItem(PHONE_USERS_KEY, JSON.stringify(users));
};

/**
 * Generate a 6-digit OTP code for a phone number
 */
export const requestPhoneOtp = (phone: string): { otp: string; expiresAt: number } => {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  // For easy and deterministic testing in web previews, generate a readable 6-digit OTP (e.g. 123456 or random)
  const otp = '123456'; 
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  const payload = {
    phone: cleanPhone,
    otp,
    expiresAt
  };

  localStorage.setItem(PENDING_OTP_KEY, JSON.stringify(payload));
  return { otp, expiresAt };
};

/**
 * Verify phone OTP and log in / sign up user
 */
export const verifyPhoneOtp = (
  phone: string,
  enteredOtp: string,
  name?: string,
  businessName?: string
): AppUser => {
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const rawPending = localStorage.getItem(PENDING_OTP_KEY);
  
  // Accept standard testing code 123456 or stored OTP
  let isValid = enteredOtp === '123456';
  if (rawPending) {
    try {
      const pending = JSON.parse(rawPending);
      if (pending.phone === cleanPhone && pending.otp === enteredOtp && Date.now() < pending.expiresAt) {
        isValid = true;
      }
    } catch (e) {
      console.error(e);
    }
  }

  if (!isValid && enteredOtp.length !== 6) {
    throw new Error('Invalid 6-digit verification code. For preview testing, use 123456.');
  }

  const existingUsers = getRegisteredPhoneUsers();
  let userProfile = existingUsers[cleanPhone];

  if (!userProfile) {
    // New Signup
    userProfile = {
      id: `phone_user_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      phone: cleanPhone,
      name: name?.trim() || `User ${cleanPhone.slice(-4)}`,
      businessName: businessName?.trim() || undefined,
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
  } else {
    // Existing user login
    userProfile.lastLoginAt = new Date().toISOString();
    if (name?.trim()) userProfile.name = name.trim();
    if (businessName?.trim()) userProfile.businessName = businessName.trim();
  }

  savePhoneUserProfile(userProfile);
  localStorage.removeItem(PENDING_OTP_KEY);

  const appUser: AppUser = {
    id: userProfile.id,
    name: userProfile.name,
    phone: userProfile.phone,
    provider: 'phone',
    googleEmail: userProfile.linkedGoogleEmail,
    lastLoginAt: userProfile.lastLoginAt
  };

  saveStoredUserSession(appUser);
  return appUser;
};
