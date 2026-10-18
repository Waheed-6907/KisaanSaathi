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
  _lastConfirmation: null,
  _lastPhone: null,

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

    if (this._recaptchaVerifier) {
      return this._recaptchaVerifier;
    }

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
    }
  },

  async sendOtp(phoneNumber, containerId = 'recaptcha-container', options = {}) {
    const e164 = this.normalizePhoneNumber(phoneNumber);
    if (!e164 || e164.length < 11) {
      throw new Error('Please enter a valid 10-digit mobile number.');
    }

    try {
      const verifier = this.getOrCreateRecaptcha(containerId, options);
      console.log('📲 [Firebase Phone Auth] Sending SMS OTP to', e164);
      const confirmationResult = await signInWithPhoneNumber(auth, e164, verifier);
      this._lastConfirmation = confirmationResult;
      this._lastPhone = e164;
      return {
        success: true,
        phone: e164,
        verificationId: confirmationResult.verificationId
      };
    } catch (err) {
      console.error('Firebase sendOtp error:', err.code, err.message);
      this.resetRecaptcha();
      throw new Error(this.getFriendlyErrorMessage(err));
    }
  },

  async verifyOtp(otpCode) {
    if (!this._lastConfirmation) {
      throw new Error('No active verification in progress. Please click "Send OTP" first.');
    }
    const cleanCode = String(otpCode).trim().replace(/\D/g, '');
    if (!cleanCode || cleanCode.length !== 6) {
      throw new Error('Please enter the 6-digit verification code received via SMS.');
    }

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
      console.error('Firebase verifyOtp error:', err.code, err.message);
      throw new Error(this.getFriendlyErrorMessage(err));
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
    switch (code) {
      case 'auth/invalid-phone-number':
        return 'The mobile number is invalid. Please check the 10-digit number.';
      case 'auth/missing-phone-number':
        return 'Please enter your 10-digit mobile number.';
      case 'auth/quota-exceeded':
        return 'SMS verification quota exceeded for today. Please try again later or contact support.';
      case 'auth/captcha-check-failed':
        return 'reCAPTCHA check failed. Please refresh the page and try again.';
      case 'auth/invalid-verification-code':
        return 'Incorrect verification code. Please check your SMS messages and re-enter the 6-digit code.';
      case 'auth/code-expired':
        return 'Verification code has expired. Please click "Resend OTP" to request a new code.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please wait a few moments before requesting a new OTP.';
      case 'auth/network-request-failed':
        return 'Network connection issue. Please check your internet connection.';
      default:
        return err.message || 'Authentication error. Please try again.';
    }
  }
};

window.KisanFirebaseAuth = KisanFirebaseAuth;
export default KisanFirebaseAuth;
