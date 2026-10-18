// KisanSaathi Firebase Modular Auth Integration
// Project: kisaansaathi-cba16

import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  RecaptchaVerifier, 
  signInWithPhoneNumber, 
  onAuthStateChanged,
  signOut 
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBPbJWlN5eCAIr_S6oZ_R3ad7ad7YDOZFQ",
  authDomain: "kisaansaathi-cba16.firebaseapp.com",
  projectId: "kisaansaathi-cba16",
  storageBucket: "kisaansaathi-cba16.firebasestorage.app",
  messagingSenderId: "424972705022",
  appId: "1:424972705022:web:7253c44021a2b8a37459af",
  measurementId: "G-WDHMSQJFWW"
};

// Initialize Firebase App & Auth exactly once
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Language setting for SMS messages (Indian English / Hindi localization)
auth.useDeviceLanguage();

const KisanFirebaseAuth = {
  app,
  auth,
  isReady: true,
  _recaptchaVerifier: null,
  _currentContainerId: null,
  _lastConfirmation: null,
  _lastPhone: null,
  _isSending: false,
  _isVerifying: false,

  getCurrentUser() {
    return auth.currentUser;
  },

  async getIdToken(forceRefresh = false) {
    if (!auth.currentUser) return null;
    return await auth.currentUser.getIdToken(forceRefresh);
  },

  normalizePhoneNumber(phone, defaultCountry = '+91') {
    if (!phone) return '';
    let cleaned = String(phone).replace(/\s+|-|\(|\)/g, '');
    if (!cleaned.startsWith('+')) {
      const digits = cleaned.replace(/\D/g, '');
      if (digits.length === 10) {
        cleaned = defaultCountry + digits;
      } else if (digits.length === 12 && digits.startsWith('91')) {
        cleaned = '+' + digits;
      } else if (digits.length === 11 && digits.startsWith('0')) {
        cleaned = defaultCountry + digits.slice(1);
      } else {
        cleaned = defaultCountry + digits;
      }
    }
    return cleaned;
  },

  getOrCreateRecaptcha(containerId = 'recaptcha-container', options = {}) {
    const el = document.getElementById(containerId);
    if (!el) {
      console.warn(`[Firebase] reCAPTCHA container #${containerId} not found in DOM`);
    }

    // Reset if container ID changed or if previous instance needs refresh
    if (this._recaptchaVerifier && this._currentContainerId !== containerId) {
      this.resetRecaptcha();
    }

    if (this._recaptchaVerifier) {
      return this._recaptchaVerifier;
    }

    this._currentContainerId = containerId;
    this._recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: options.size || 'invisible',
      callback: (response) => {
        console.log('✔ [Firebase] reCAPTCHA solved');
        if (typeof options.onSolved === 'function') options.onSolved(response);
      },
      'expired-callback': () => {
        console.warn('⚠ [Firebase] reCAPTCHA expired, resetting...');
        this.resetRecaptcha();
        if (typeof options.onExpired === 'function') options.onExpired();
      }
    });

    return this._recaptchaVerifier;
  },

  resetRecaptcha() {
    try {
      if (this._recaptchaVerifier) {
        this._recaptchaVerifier.clear();
        this._recaptchaVerifier = null;
      }
      this._currentContainerId = null;
      const containers = [
        'recaptcha-container', 
        'loginFarmerRecaptcha', 
        'loginConsumerRecaptcha', 
        'regFarmerRecaptcha', 
        'regConsumerRecaptcha'
      ];
      containers.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = '';
      });
    } catch (e) {
      console.warn('reCAPTCHA cleanup notice:', e.message);
      this._recaptchaVerifier = null;
      this._currentContainerId = null;
    }
  },

  async sendOtp(phoneNumber, containerId = 'recaptcha-container', options = {}) {
    const e164 = this.normalizePhoneNumber(phoneNumber);
    if (!e164 || e164.length < 11) {
      const err = new Error('Please enter a valid 10-digit Indian mobile number.');
      err.code = 'auth/invalid-phone-number';
      throw err;
    }

    // Guard against duplicate / concurrent in-flight requests
    if (this._isSending) {
      const err = new Error('An SMS dispatch request is already in progress. Please wait.');
      err.code = 'auth/already-in-progress';
      throw err;
    }

    this._isSending = true;

    try {
      const verifier = this.getOrCreateRecaptcha(containerId, options);
      console.log('📲 [Firebase Phone Auth] Sending SMS OTP to', e164);
      
      // Exact signInWithPhoneNumber call: UI displays "OTP sent" ONLY after this Promise resolves
      const confirmationResult = await signInWithPhoneNumber(auth, e164, verifier);
      
      this._lastConfirmation = confirmationResult;
      this._lastPhone = e164;
      
      console.log('✔ [Firebase Phone Auth] SMS verification code dispatched successfully to', e164);
      return {
        success: true,
        phone: e164,
        verificationId: confirmationResult.verificationId
      };
    } catch (err) {
      // Diagnostic safe logging - never logs tokens or credentials
      const errCode = err.code || 'unknown';
      const errMsg = err.message || String(err);
      console.error('[Firebase Phone Auth] sendOtp failure:', { code: errCode, message: errMsg });
      
      // Reset reCAPTCHA after any failure to prevent stale state on retry
      this.resetRecaptcha();
      
      const friendlyMessage = this.getFriendlyErrorMessage(err);
      const wrappedErr = new Error(friendlyMessage);
      wrappedErr.code = errCode;
      wrappedErr.originalMessage = errMsg;
      throw wrappedErr;
    } finally {
      this._isSending = false;
    }
  },

  async verifyOtp(otpCode) {
    if (!this._lastConfirmation) {
      const err = new Error('No active verification in progress. Please click "Send OTP" first.');
      err.code = 'auth/missing-verification-id';
      throw err;
    }
    const cleanCode = String(otpCode).trim().replace(/\D/g, '');
    if (!cleanCode || cleanCode.length !== 6) {
      const err = new Error('Please enter the 6-digit verification code received via SMS.');
      err.code = 'auth/invalid-verification-code';
      throw err;
    }

    if (this._isVerifying) {
      const err = new Error('Verification is already in progress. Please wait.');
      err.code = 'auth/already-in-progress';
      throw err;
    }

    this._isVerifying = true;

    try {
      console.log('🔐 [Firebase Phone Auth] Confirming verification code...');
      const userCredential = await this._lastConfirmation.confirm(cleanCode);
      const user = userCredential.user;
      const idToken = await user.getIdToken();
      console.log('✔ [Firebase Phone Auth] Verified successfully. UID:', user.uid);
      return {
        success: true,
        verified: true,
        user,
        idToken,
        uid: user.uid,
        phoneNumber: user.phoneNumber
      };
    } catch (err) {
      const errCode = err.code || 'unknown';
      const errMsg = err.message || String(err);
      console.error('[Firebase Phone Auth] verifyOtp failure:', { code: errCode, message: errMsg });
      
      const friendlyMessage = this.getFriendlyErrorMessage(err);
      const wrappedErr = new Error(friendlyMessage);
      wrappedErr.code = errCode;
      wrappedErr.originalMessage = errMsg;
      throw wrappedErr;
    } finally {
      this._isVerifying = false;
    }
  },

  async signOut() {
    try {
      await signOut(auth);
      this._lastConfirmation = null;
      this._lastPhone = null;
      this.resetRecaptcha();
    } catch (e) {
      console.warn('Firebase signout notice:', e.message);
    }
  },

  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, callback);
  },

  getFriendlyErrorMessage(err) {
    const code = err.code || '';
    const msg = String(err.message || '');

    // Check for billing requirement error
    if (code === 'auth/billing-not-enabled' || msg.includes('BILLING_NOT_ENABLED') || msg.includes('billing-not-enabled')) {
      return 'Cloud Billing is not enabled on Firebase project "kisaansaathi-cba16". Google requires an active billing account (Blaze pay-as-you-go plan) to dispatch real SMS messages to mobile carriers. Alternatively, test phone numbers configured in Firebase Console can be used without billing.';
    }

    // Check for domain authorization
    if (code === 'auth/unauthorized-domain' || msg.includes('unauthorized-domain')) {
      return 'Domain authorization error: "kisaan-saathi-pi.vercel.app" is not authorized in Firebase Console > Authentication > Settings > Authorized domains.';
    }

    // Check for disabled provider
    if (code === 'auth/operation-not-allowed' || msg.includes('operation-not-allowed')) {
      return 'Phone authentication is disabled in Firebase Console. Please enable Phone provider under Authentication > Sign-in method.';
    }

    // Check for SMS region / country restrictions
    if (code === 'auth/region-not-allowed' || code === 'auth/country-code-blocked' || msg.includes('region-not-allowed') || msg.includes('country-code-blocked')) {
      return 'SMS to this country (+91 India) is blocked by your Firebase SMS Region Policy. Enable India in Firebase Console > Authentication > Settings > SMS Region Policy.';
    }

    // Check for app credential / reCAPTCHA failure
    if (code === 'auth/invalid-app-credential' || code === 'auth/captcha-check-failed' || msg.includes('captcha-check-failed')) {
      return 'reCAPTCHA verification failed or token expired. Please refresh the page and try again.';
    }

    // Check for quota
    if (code === 'auth/quota-exceeded' || code === 'auth/sms-quota-exceeded' || msg.includes('quota-exceeded')) {
      return 'SMS verification quota exceeded for today. Please try again tomorrow or contact administrator.';
    }

    switch (code) {
      case 'auth/invalid-phone-number':
        return 'The mobile number is invalid. Please check the 10-digit number.';
      case 'auth/missing-phone-number':
        return 'Please enter your 10-digit mobile number.';
      case 'auth/invalid-verification-code':
        return 'Incorrect verification code. Please check your SMS messages and re-enter the 6-digit code.';
      case 'auth/code-expired':
        return 'Verification code has expired. Please click "Resend Code" to request a new code.';
      case 'auth/too-many-requests':
        return 'Too many SMS requests from this device. Please wait a few moments before requesting a new OTP.';
      case 'auth/network-request-failed':
        return 'Network connection issue. Please check your internet connection.';
      case 'auth/app-not-authorized':
        return 'This web application is not authorized to use Firebase Authentication with the current API key.';
      default:
        return err.message || 'Authentication error. Please try again.';
    }
  }
};

window.KisanFirebaseAuth = KisanFirebaseAuth;
export default KisanFirebaseAuth;
