import React from 'react';
import { CloudDownload, Check, X, Shield, Calendar, Layers, Users, ShoppingCart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';

export const DriveRestorePromptModal: React.FC = () => {
  const { pendingDriveBackupPrompt, dismissDrivePrompt } = useAuth();
  const { 
    importDataFromJSON, 
    showToast 
  } = useBusiness();

  if (!pendingDriveBackupPrompt) return null;

  const { info, payload } = pendingDriveBackupPrompt;
  const backupOrdersCount = payload.data?.orders?.length || 0;
  const backupCustCount = payload.data?.customers?.length || 0;
  const backupExpCount = payload.data?.expenditures?.length || 0;

  const handleRestore = () => {
    try {
      const jsonString = JSON.stringify(payload.data);
      const success = importDataFromJSON(jsonString);
      if (success) {
        showToast('Successfully restored all data from your Google Drive backup!', 'success');
      } else {
        showToast('Could not restore some data fields', 'warning');
      }
    } catch (e: any) {
      showToast(e.message || 'Restore error', 'error');
    } finally {
      dismissDrivePrompt();
    }
  };

  return (
    <div 
      id="drive-restore-prompt-backdrop" 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
    >
      <div 
        id="drive-restore-prompt-card"
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden text-slate-900 dark:text-white"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white text-center relative">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-3 border border-white/30 shadow-md">
            <CloudDownload className="w-7 h-7 text-white" />
          </div>
          <h3 className="font-extrabold text-lg font-['Outfit'] tracking-tight">
            Google Drive Backup Found
          </h3>
          <p className="text-xs text-emerald-100 mt-1">
            We discovered an existing business backup for this account.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-indigo-500" />
                Backup Timestamp:
              </span>
              <span className="font-bold text-slate-800 dark:text-white">
                {new Date(info.modifiedTime).toLocaleString()}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-center">
              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
                  <ShoppingCart className="w-3 h-3 text-indigo-500" />
                  <span>Orders</span>
                </div>
                <span className="font-extrabold text-sm text-slate-800 dark:text-white">
                  {backupOrdersCount}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
                  <Users className="w-3 h-3 text-emerald-500" />
                  <span>Customers</span>
                </div>
                <span className="font-extrabold text-sm text-slate-800 dark:text-white">
                  {backupCustCount}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 mb-0.5">
                  <Layers className="w-3 h-3 text-amber-500" />
                  <span>Expenses</span>
                </div>
                <span className="font-extrabold text-sm text-slate-800 dark:text-white">
                  {backupExpCount}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 text-center leading-relaxed">
            Would you like to sync and load this data into your app right now?
          </p>

          <div className="flex gap-3 pt-2">
            <button
              id="dismiss-drive-prompt-btn"
              type="button"
              onClick={dismissDrivePrompt}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            >
              Keep Current / Skip
            </button>
            <button
              id="confirm-restore-drive-btn"
              type="button"
              onClick={handleRestore}
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Restore & Sync</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
