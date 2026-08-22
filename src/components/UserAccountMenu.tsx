import React, { useState, useRef, useEffect } from 'react';
import { 
  Cloud, 
  CloudCheck, 
  CloudOff, 
  RefreshCw, 
  LogOut, 
  User, 
  Smartphone, 
  Check, 
  ExternalLink,
  ChevronDown,
  Shield,
  Layers,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';

export const UserAccountMenu: React.FC = () => {
  const { 
    user, 
    isAuthenticated, 
    isGoogleLinked, 
    googleAccessToken,
    openAuthModal, 
    linkGoogleAccount,
    logout, 
    syncStatus, 
    lastSyncTime, 
    driveBackupInfo, 
    autoSyncEnabled, 
    setAutoSyncEnabled,
    syncNow,
    restoreFromDrive
  } = useAuth();

  const { 
    orders, 
    expenditures, 
    customers, 
    products, 
    expenseProducts, 
    expensePurposes, 
    categories, 
    settings, 
    activityLogs,
    importDataFromJSON,
    showToast 
  } = useBusiness();

  const [isOpen, setIsOpen] = useState(false);
  const [isSyncingAction, setIsSyncingAction] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDataSnapshot = () => ({
    orders,
    expenditures,
    customers,
    products,
    expenseProducts,
    expensePurposes,
    categories,
    settings,
    activityLogs
  });

  const handleManualBackup = async () => {
    setIsSyncingAction(true);
    try {
      const res = await syncNow(getDataSnapshot, true);
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'warning');
      }
    } catch (e: any) {
      showToast(e.message || 'Backup failed', 'error');
    } finally {
      setIsSyncingAction(false);
    }
  };

  const handleManualRestore = async () => {
    if (!window.confirm('Restore from Google Drive? This will update your local records with the latest backup stored on your Google Drive.')) {
      return;
    }

    setIsSyncingAction(true);
    try {
      const res = await restoreFromDrive((data) => {
        importDataFromJSON(JSON.stringify(data));
      });
      if (res.success) {
        showToast(res.message, 'success');
      } else {
        showToast(res.message, 'warning');
      }
    } catch (e: any) {
      showToast(e.message || 'Restore failed', 'error');
    } finally {
      setIsSyncingAction(false);
    }
  };

  const handleLinkGoogle = async () => {
    try {
      await linkGoogleAccount();
      showToast('Google Drive linked successfully to your phone profile!', 'success');
    } catch (e: any) {
      showToast(e.message || 'Failed to link Google Drive', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <button
        id="top-nav-signin-btn"
        type="button"
        onClick={() => openAuthModal('google')}
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-full text-xs font-semibold shadow-xs hover:shadow-md active:scale-95 transition-all cursor-pointer shrink-0"
      >
        {/* Google G mini icon */}
        <svg className="w-3.5 h-3.5 bg-white rounded-full p-0.5 shrink-0" viewBox="0 0 48 48">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
        <span className="hidden sm:inline">Sign In & Sync</span>
        <span className="sm:hidden">Sign In</span>
      </button>
    );
  }

  // Format relative time
  const getFormattedSyncTime = () => {
    if (!lastSyncTime) return 'Never';
    const diff = Math.floor((Date.now() - new Date(lastSyncTime).getTime()) / 1000);
    if (diff < 10) return 'Just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return new Date(lastSyncTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Account trigger badge */}
      <button
        id="user-account-menu-trigger"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 sm:gap-2 p-1 sm:px-2.5 sm:py-1 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer select-none shrink-0"
      >
        {/* Avatar or Initial */}
        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs overflow-hidden shrink-0">
          {user?.photoURL ? (
            <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
          )}
        </div>

        {/* User identifier + Sync dot */}
        <div className="hidden md:flex flex-col items-start text-left min-w-0 mr-1">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[110px] leading-tight font-['Outfit']">
            {user?.name || 'Account'}
          </span>
          <div className="flex items-center gap-1 text-[10px]">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
              syncStatus === 'synced' ? 'bg-emerald-500' :
              syncStatus === 'syncing' ? 'bg-amber-500 animate-spin' :
              syncStatus === 'error' ? 'bg-rose-500' : 'bg-slate-400'
            }`} />
            <span className="text-slate-500 dark:text-slate-400 truncate max-w-[90px]">
              {syncStatus === 'syncing' ? 'Syncing...' : isGoogleLinked ? 'Drive Synced' : 'Phone Account'}
            </span>
          </div>
        </div>

        <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline shrink-0" />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div 
          id="user-account-dropdown"
          className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-24px)] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-4 text-slate-900 dark:text-white animate-in fade-in slide-in-from-top-2 duration-150"
        >
          {/* User Header Profile Card */}
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-sm shadow-md overflow-hidden shrink-0">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate font-['Outfit']">
                {user?.name}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                {user?.email || user?.phone || 'Logged in user'}
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60">
                  {user?.provider === 'google' ? (
                    <>
                      {/* Google G mini */}
                      <svg className="w-2.5 h-2.5" viewBox="0 0 48 48">
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                      </svg>
                      <span>Google Account</span>
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-2.5 h-2.5 text-emerald-500" />
                      <span>Phone Account</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Google Drive Status Section */}
          <div className="my-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Google Drive Backup
                </span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isGoogleLinked 
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' 
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {isGoogleLinked ? 'Connected' : 'Not Linked'}
              </span>
            </div>

            {isGoogleLinked ? (
              <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Last Cloud Backup:</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {getFormattedSyncTime()}
                  </span>
                </div>
                {driveBackupInfo && (
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>File in Drive:</span>
                    <span className="font-mono text-indigo-500 dark:text-indigo-400">
                      erik_hub_finance_backup.json
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-2">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
                  Connect Google Drive to automatically store encrypted backups.
                </p>
                <button
                  id="link-google-drive-action-btn"
                  type="button"
                  onClick={handleLinkGoogle}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-600 shadow-2xs transition-colors cursor-pointer"
                >
                  <LinkIcon className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Connect Google Drive</span>
                </button>
              </div>
            )}
          </div>

          {/* Action Buttons: Backup & Restore */}
          {isGoogleLinked && (
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                id="manual-backup-now-btn"
                type="button"
                onClick={handleManualBackup}
                disabled={isSyncingAction}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSyncingAction ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Cloud className="w-3.5 h-3.5" />
                )}
                <span>Backup Now</span>
              </button>

              <button
                id="manual-restore-drive-btn"
                type="button"
                onClick={handleManualRestore}
                disabled={isSyncingAction}
                className="flex items-center justify-center gap-1.5 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-500" />
                <span>Restore Data</span>
              </button>
            </div>
          )}

          {/* Auto Sync Toggle */}
          <div className="flex items-center justify-between px-1 py-2 border-t border-slate-100 dark:border-slate-800">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
              Auto-Sync on Changes
            </span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={autoSyncEnabled}
                onChange={(e) => setAutoSyncEnabled(e.target.value === 'true' || e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-8 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Sign Out Button */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              id="user-logout-btn"
              type="button"
              onClick={() => {
                logout();
                setIsOpen(false);
                showToast('Signed out successfully.', 'info');
              }}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
