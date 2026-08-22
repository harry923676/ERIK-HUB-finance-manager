import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  RefreshCw, 
  Cloud, 
  ArrowRight,
  User as UserIcon,
  Building,
  KeyRound
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';

const COUNTRY_CODES = [
  { code: '+91', country: 'IN', label: 'India (+91)' },
  { code: '+1', country: 'US', label: 'USA / Canada (+1)' },
  { code: '+44', country: 'UK', label: 'UK (+44)' },
  { code: '+971', country: 'AE', label: 'UAE (+971)' },
  { code: '+65', country: 'SG', label: 'Singapore (+65)' },
  { code: '+61', country: 'AU', label: 'Australia (+61)' },
];

export const AuthModal: React.FC = () => {
  const { 
    user,
    isAuthModalOpen, 
    closeAuthModal, 
    authModalTab, 
    loginWithGoogle, 
    sendPhoneOtp, 
    loginWithPhone 
  } = useAuth();
  const { showToast } = useBusiness();

  const [activeTab, setActiveTab] = useState<'google' | 'phone'>(authModalTab || 'google');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  
  const [step, setStep] = useState<'phone_entry' | 'otp_verification'>('phone_entry');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Sync tab with context if opened with specific tab
  React.useEffect(() => {
    if (authModalTab) {
      setActiveTab(authModalTab);
    }
  }, [authModalTab]);

  // Countdown timer for OTP
  React.useEffect(() => {
    let interval: any = null;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  if (!isAuthModalOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await loginWithGoogle();
      showToast('Signed in successfully with Google! Google Drive sync activated.', 'success');
      closeAuthModal();
    } catch (err: any) {
      showToast(err.message || 'Google Sign-In was cancelled or failed.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 7) {
      showToast('Please enter a valid phone number', 'warning');
      return;
    }

    const fullNumber = `${countryCode} ${phoneNumber.trim()}`;
    setIsLoading(true);

    try {
      sendPhoneOtp(fullNumber);
      setStep('otp_verification');
      setCountdown(60);
      showToast(`Verification code sent to ${fullNumber}`, 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to send OTP code', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length < 4) {
      showToast('Please enter the 6-digit verification code', 'warning');
      return;
    }

    setIsLoading(true);
    const fullNumber = `${countryCode} ${phoneNumber.trim()}`;

    try {
      await loginWithPhone(fullNumber, otpCode, fullName, businessName);
      showToast(`Welcome! Logged in with ${fullNumber}`, 'success');
      closeAuthModal();
      setStep('phone_entry');
      setOtpCode('');
    } catch (err: any) {
      showToast(err.message || 'Verification failed. Try demo code: 123456', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemoOtp = () => {
    setOtpCode('123456');
    showToast('Demo OTP (123456) filled for testing', 'info');
  };

  return (
    <div 
      id="auth-modal-backdrop" 
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
    >
      <div 
        id="auth-modal-card" 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden transition-all text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with App Logo & Branding */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 p-6 text-white overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -left-8 -top-8 w-28 h-28 bg-amber-400/20 rounded-full blur-xl pointer-events-none" />
          
          <button 
            id="close-auth-modal-btn"
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Cloud className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg tracking-tight font-['Outfit']">
                ERIK-HUB Cloud Account
              </h3>
              <p className="text-[11px] text-indigo-200 font-medium">
                Sync data across devices with Google Drive
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-200 mt-2 leading-relaxed">
            Log in to automatically back up orders, payments, expenditures, and business records to your personal Google Drive.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 p-1.5">
          <button
            id="auth-tab-google"
            type="button"
            onClick={() => { setActiveTab('google'); setStep('phone_entry'); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'google'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {/* Google G icon */}
            <svg className="w-4 h-4" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            <span>Google Account</span>
          </button>

          <button
            id="auth-tab-phone"
            type="button"
            onClick={() => setActiveTab('phone')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'phone'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-500" />
            <span>Phone Number</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6">
          {activeTab === 'google' ? (
            <div className="flex flex-col items-center text-center py-2 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center shadow-inner">
                {/* Official Google Icon */}
                <svg className="w-8 h-8" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                </svg>
              </div>

              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white">
                  Direct Google Sign-In & Drive Sync
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  One-click sign in. Grants access to create and update <span className="font-semibold text-indigo-600 dark:text-indigo-400">erik_hub_finance_backup.json</span> on your Google Drive.
                </p>
              </div>

              {/* Official Google Sign-In Button */}
              <button
                id="google-signin-action-btn"
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-100 font-semibold text-sm rounded-2xl border border-slate-300 dark:border-slate-700 shadow-md hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
                ) : (
                  <>
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>

              {/* Security Badges */}
              <div className="w-full pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center gap-4 text-[11px] text-slate-400">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Encrypted Backup</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Private to Your Drive</span>
                </div>
              </div>

              {/* Development / Testing Notice Card */}
              <div className="w-full text-left p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-[11px] text-amber-800 dark:text-amber-300">
                  <span>ℹ️ App in Testing / Developer Verification Mode</span>
                </div>
                <p className="text-[11px] text-amber-700 dark:text-amber-300/90 leading-relaxed">
                  If Google shows <span className="font-semibold">"Error 403: access_denied"</span> or <span className="font-semibold">"has not completed verification"</span>, add your Google account (<span className="font-mono">{user?.email || 'pawanpazi9178@gmail.com'}</span>) under <strong>Test users</strong> in Google Cloud Console OAuth Consent Screen.
                </p>
                <div className="pt-1 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveTab('phone')}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Use Instant Phone Login instead →</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              {step === 'phone_entry' ? (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        id="phone-country-code-select"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold focus:ring-2 focus:ring-indigo-500 outline-hidden"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                      <input
                        id="phone-number-input"
                        type="tel"
                        required
                        placeholder="98765 43210"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-hidden tracking-wider"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Your Name <span className="text-[11px] text-slate-400 font-normal">(for new profile)</span>
                    </label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="phone-user-name-input"
                        type="text"
                        placeholder="e.g. Pawan Paji"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-hidden"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                      Business Name <span className="text-[11px] text-slate-400 font-normal">(optional)</span>
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        id="phone-business-name-input"
                        type="text"
                        placeholder="e.g. ERIK-HUB Enterprises"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-hidden"
                      />
                    </div>
                  </div>

                  <button
                    id="phone-send-otp-btn"
                    type="submit"
                    disabled={isLoading || !phoneNumber}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    {isLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <span>Get Verification Code (OTP)</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="text-center pb-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Enter the 6-digit code sent to <br />
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {countryCode} {phoneNumber}
                      </span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 text-center">
                      6-Digit Verification Code
                    </label>
                    <div className="relative max-w-xs mx-auto">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="phone-otp-code-input"
                        type="text"
                        maxLength={6}
                        required
                        autoFocus
                        placeholder="123456"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-indigo-500/50 bg-white dark:bg-slate-800 text-center font-mono text-lg font-bold tracking-widest focus:ring-2 focus:ring-indigo-500 outline-hidden"
                      />
                    </div>
                  </div>

                  {/* Fast Testing helper button */}
                  <div className="text-center">
                    <button
                      id="autofill-demo-otp-btn"
                      type="button"
                      onClick={handleFillDemoOtp}
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Auto-fill Preview Demo Code (123456)</span>
                    </button>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      id="phone-back-to-entry-btn"
                      type="button"
                      onClick={() => setStep('phone_entry')}
                      className="flex-1 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      Change Number
                    </button>
                    <button
                      id="phone-verify-otp-btn"
                      type="submit"
                      disabled={isLoading || otpCode.length < 4}
                      className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? 'Verifying...' : 'Verify & Login'}
                    </button>
                  </div>

                  {countdown > 0 ? (
                    <p className="text-[11px] text-center text-slate-400">
                      Resend code in {countdown}s
                    </p>
                  ) : (
                    <div className="text-center">
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer"
                      >
                        Resend OTP Code
                      </button>
                    </div>
                  )}
                </form>
              )}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 dark:bg-slate-950/80 px-6 py-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-emerald-500" />
            Zero-knowledge offline first
          </span>
          <span>ERIK-HUB v2.0</span>
        </div>
      </div>
    </div>
  );
};
