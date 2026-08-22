import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  AppUser, 
  signInWithGoogle, 
  logoutAuth, 
  getStoredUserSession, 
  getCachedAccessToken, 
  setCachedAccessToken 
} from '../services/firebaseAuth';
import { 
  requestPhoneOtp, 
  verifyPhoneOtp, 
  savePhoneUserProfile, 
  getRegisteredPhoneUsers 
} from '../services/phoneAuthService';
import { 
  findDriveBackupFile, 
  saveBackupToDrive, 
  downloadBackupFromDrive, 
  DriveFileInfo, 
  BackupDataPayload 
} from '../services/googleDriveService';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isGoogleLinked: boolean;
  googleAccessToken: string | null;
  
  // Auth Modal Controls
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalTab: 'google' | 'phone';
  openAuthModal: (tab?: 'google' | 'phone') => void;
  closeAuthModal: () => void;

  // Actions
  loginWithGoogle: () => Promise<void>;
  sendPhoneOtp: (phone: string) => { otp: string; expiresAt: number };
  loginWithPhone: (phone: string, otp: string, name?: string, businessName?: string) => Promise<AppUser>;
  linkGoogleAccount: () => Promise<void>;
  logout: () => Promise<void>;

  // Cloud & Drive Sync
  syncStatus: SyncStatus;
  lastSyncTime: Date | null;
  driveBackupInfo: DriveFileInfo | null;
  autoSyncEnabled: boolean;
  setAutoSyncEnabled: (enabled: boolean) => void;
  syncNow: (dataGetter: () => any, manual?: boolean) => Promise<{ success: boolean; message: string }>;
  restoreFromDrive: (applyData: (data: any) => void) => Promise<{ success: boolean; message: string; payload?: BackupDataPayload }>;
  checkDriveBackup: () => Promise<DriveFileInfo | null>;
  pendingDriveBackupPrompt: { info: DriveFileInfo; payload: BackupDataPayload } | null;
  dismissDrivePrompt: () => void;
  triggerAutoSync: (dataGetter: () => any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTO_SYNC_KEY = 'erikhub_auto_sync_enabled_v1';
const LAST_SYNC_KEY = 'erikhub_last_sync_timestamp_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(() => getStoredUserSession());
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(() => getCachedAccessToken());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'google' | 'phone'>('google');

  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(() => {
    try {
      const stored = localStorage.getItem(LAST_SYNC_KEY);
      return stored ? new Date(stored) : null;
    } catch {
      return null;
    }
  });
  const [driveBackupInfo, setDriveBackupInfo] = useState<DriveFileInfo | null>(null);
  const [autoSyncEnabled, setAutoSyncEnabledState] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(AUTO_SYNC_KEY);
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  const [pendingDriveBackupPrompt, setPendingDriveBackupPrompt] = useState<{
    info: DriveFileInfo;
    payload: BackupDataPayload;
  } | null>(null);

  const debounceTimerRef = useRef<any>(null);

  const setAutoSyncEnabled = (val: boolean) => {
    setAutoSyncEnabledState(val);
    try {
      localStorage.setItem(AUTO_SYNC_KEY, JSON.stringify(val));
    } catch (e) {
      console.error(e);
    }
  };

  const openAuthModal = (tab: 'google' | 'phone' = 'google') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Check for Drive backup once token is available
  const checkDriveBackup = useCallback(async (): Promise<DriveFileInfo | null> => {
    const token = googleAccessToken || getCachedAccessToken();
    if (!token) return null;

    try {
      const file = await findDriveBackupFile(token);
      if (file) {
        setDriveBackupInfo(file);
      }
      return file;
    } catch (error) {
      console.warn('Could not check Google Drive backup:', error);
      return null;
    }
  }, [googleAccessToken]);

  // Initial check on login
  useEffect(() => {
    if (googleAccessToken) {
      checkDriveBackup();
    }
  }, [googleAccessToken, checkDriveBackup]);

  // Handle Google Sign-in
  const loginWithGoogle = async () => {
    try {
      setSyncStatus('syncing');
      const { user: appUser, accessToken } = await signInWithGoogle();
      setUser(appUser);
      setGoogleAccessToken(accessToken);
      setCachedAccessToken(accessToken);
      setIsAuthModalOpen(false);

      // Check if existing backup exists on Google Drive for this account
      try {
        const driveFile = await findDriveBackupFile(accessToken);
        if (driveFile) {
          setDriveBackupInfo(driveFile);
          // Download and see if it has data to restore
          const backupPayload = await downloadBackupFromDrive(accessToken, driveFile.id);
          if (backupPayload && backupPayload.data) {
            setPendingDriveBackupPrompt({
              info: driveFile,
              payload: backupPayload
            });
          }
        }
      } catch (e) {
        console.warn('Initial Drive scan notice:', e);
      }

      setSyncStatus('synced');
    } catch (err: any) {
      setSyncStatus('error');
      throw err;
    }
  };

  // Handle Phone OTP Request
  const sendPhoneOtp = (phone: string) => {
    return requestPhoneOtp(phone);
  };

  // Handle Phone Login / Verification
  const loginWithPhone = async (
    phone: string, 
    otp: string, 
    name?: string, 
    businessName?: string
  ): Promise<AppUser> => {
    const appUser = verifyPhoneOtp(phone, otp, name, businessName);
    setUser(appUser);
    setIsAuthModalOpen(false);
    return appUser;
  };

  // Link Google Account to existing phone profile for GDrive backup
  const linkGoogleAccount = async () => {
    const { user: googleUser, accessToken } = await signInWithGoogle();
    setGoogleAccessToken(accessToken);
    setCachedAccessToken(accessToken);

    if (user && user.provider === 'phone') {
      const updatedUser: AppUser = {
        ...user,
        googleEmail: googleUser.email,
      };
      setUser(updatedUser);

      // Save to registered phone list
      const phoneUsers = getRegisteredPhoneUsers();
      if (phoneUsers[user.phone || '']) {
        phoneUsers[user.phone || ''].linkedGoogleEmail = googleUser.email;
        savePhoneUserProfile(phoneUsers[user.phone || '']);
      }
    }
  };

  // Logout
  const logout = async () => {
    await logoutAuth();
    setUser(null);
    setGoogleAccessToken(null);
    setCachedAccessToken(null);
    setDriveBackupInfo(null);
    setSyncStatus('idle');
  };

  // Sync to Google Drive
  const syncNow = async (
    dataGetter: () => any, 
    manual: boolean = false
  ): Promise<{ success: boolean; message: string }> => {
    const token = googleAccessToken || getCachedAccessToken();

    if (!token) {
      if (manual) {
        openAuthModal('google');
      }
      return { 
        success: false, 
        message: 'Please sign in with Google or connect your Google Drive to sync.' 
      };
    }

    try {
      setSyncStatus('syncing');
      const rawData = dataGetter();
      
      const payload: BackupDataPayload = {
        version: '2.0.0',
        appName: 'ERIK-HUB Finance manager',
        lastModified: new Date().toISOString(),
        backupDate: new Date().toLocaleDateString(),
        userEmail: user?.email || user?.googleEmail,
        userPhone: user?.phone,
        data: rawData
      };

      const result = await saveBackupToDrive(token, payload, driveBackupInfo?.id);
      setDriveBackupInfo(result);

      const now = new Date();
      setLastSyncTime(now);
      localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
      setSyncStatus('synced');

      return { 
        success: true, 
        message: `Successfully backed up to Google Drive at ${now.toLocaleTimeString()}` 
      };
    } catch (error: any) {
      console.error('Google Drive Sync error:', error);
      setSyncStatus('error');
      return { 
        success: false, 
        message: error.message || 'Failed to sync with Google Drive.' 
      };
    }
  };

  // Restore from Google Drive
  const restoreFromDrive = async (
    applyData: (data: any) => void
  ): Promise<{ success: boolean; message: string; payload?: BackupDataPayload }> => {
    const token = googleAccessToken || getCachedAccessToken();

    if (!token) {
      openAuthModal('google');
      return { success: false, message: 'Please connect Google Drive to restore backups.' };
    }

    try {
      setSyncStatus('syncing');
      let targetFile = driveBackupInfo;
      if (!targetFile) {
        targetFile = await findDriveBackupFile(token);
      }

      if (!targetFile) {
        setSyncStatus('idle');
        return { success: false, message: 'No existing backup found in your Google Drive.' };
      }

      const backup = await downloadBackupFromDrive(token, targetFile.id);
      if (backup && backup.data) {
        applyData(backup.data);
        const now = new Date();
        setLastSyncTime(now);
        localStorage.setItem(LAST_SYNC_KEY, now.toISOString());
        setSyncStatus('synced');
        return { 
          success: true, 
          message: `Successfully restored backup from ${new Date(targetFile.modifiedTime).toLocaleString()}`,
          payload: backup
        };
      } else {
        setSyncStatus('error');
        return { success: false, message: 'Backup file is empty or corrupted.' };
      }
    } catch (error: any) {
      console.error('Restore error:', error);
      setSyncStatus('error');
      return { success: false, message: error.message || 'Failed to download backup from Google Drive.' };
    }
  };

  // Auto-sync debounced trigger
  const triggerAutoSync = useCallback((dataGetter: () => any) => {
    if (!autoSyncEnabled) return;
    const token = googleAccessToken || getCachedAccessToken();
    if (!token) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      syncNow(dataGetter, false);
    }, 3500); // 3.5s debounce
  }, [autoSyncEnabled, googleAccessToken]);

  const dismissDrivePrompt = () => {
    setPendingDriveBackupPrompt(null);
  };

  const isGoogleLinked = Boolean(googleAccessToken || user?.provider === 'google' || user?.googleEmail);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isGoogleLinked,
        googleAccessToken,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        loginWithGoogle,
        sendPhoneOtp,
        loginWithPhone,
        linkGoogleAccount,
        logout,
        syncStatus,
        lastSyncTime,
        driveBackupInfo,
        autoSyncEnabled,
        setAutoSyncEnabled,
        syncNow,
        restoreFromDrive,
        checkDriveBackup,
        pendingDriveBackupPrompt,
        dismissDrivePrompt,
        triggerAutoSync
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
