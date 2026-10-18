/**
 * KisanSaathi - Server-Side Firebase ID Token Verification & Supabase Profile Mapping
 * Route: /api/auth/verify-firebase (routed via /api/textbee?action=firebase-verify)
 * 
 * Verifies Firebase RS256 JWT ID tokens against Google's public x509 certificates.
 * Matches verified phone numbers against existing Supabase profiles (Farmers & Consumers).
 * Links Firebase UID to Supabase profiles safely without overwriting historical data.
 */

const crypto = require('crypto');
const https = require('https');

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'kisaansaathi-cba16';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ytuiolcffxcqnwlefvrr.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_rhZSeYOxbYh1pVJGKSGpDw_Xswiu0XH';

// Cache for Google's public certificates
let publicKeysCache = null;
let publicKeysExpiresAt = 0;

/**
 * Fetches Google's public certificates for Firebase ID Token verification
 */
function fetchGoogleCertificates() {
  return new Promise((resolve, reject) => {
    const now = Date.now();
    if (publicKeysCache && now < publicKeysExpiresAt) {
      return resolve(publicKeysCache);
    }

    const certUrl = 'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
    https.get(certUrl, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode !== 200) {
            return reject(new Error(`Failed to fetch certificates: HTTP ${res.statusCode}`));
          }
          const certs = JSON.parse(data);
          // Parse Cache-Control max-age header
          const cacheControl = res.headers['cache-control'] || '';
          const match = cacheControl.match(/max-age=(\d+)/);
          const maxAgeSec = match ? parseInt(match[1], 10) : 3600;
          publicKeysCache = certs;
          publicKeysExpiresAt = Date.now() + (maxAgeSec * 1000);
          resolve(certs);
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', reject);
  });
}

/**
 * Base64 URL decoder
 */
function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Verifies a Firebase ID token (JWT)
 */
async function verifyFirebaseIdToken(idToken) {
  if (!idToken || typeof idToken !== 'string') {
    throw new Error('Missing ID token');
  }

  const parts = idToken.split('.');
  if (parts.length !== 3) {
    throw new Error('Malformed JWT token structure');
  }

  const [rawHeader, rawPayload, rawSignature] = parts;
  let header, payload;
  try {
    header = JSON.parse(base64UrlDecode(rawHeader));
    payload = JSON.parse(base64UrlDecode(rawPayload));
  } catch (err) {
    throw new Error('Failed to parse token segments: ' + err.message);
  }

  if (header.alg !== 'RS256') {
    throw new Error(`Unsupported algorithm: ${header.alg}. Expected RS256.`);
  }

  if (!header.kid) {
    throw new Error('Missing key identifier (kid) in token header');
  }

  // 1. Verify claims
  const nowSec = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < nowSec) {
    throw new Error('Firebase ID token has expired. Please refresh verification.');
  }

  if (payload.aud !== FIREBASE_PROJECT_ID) {
    throw new Error(`Token audience mismatch: got "${payload.aud}", expected "${FIREBASE_PROJECT_ID}"`);
  }

  const expectedIssuer = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;
  if (payload.iss !== expectedIssuer) {
    throw new Error(`Token issuer mismatch: got "${payload.iss}", expected "${expectedIssuer}"`);
  }

  if (!payload.sub || typeof payload.sub !== 'string') {
    throw new Error('Token subject (sub/uid) is invalid or empty');
  }

  // 2. Verify signature against Google certificate
  const certs = await fetchGoogleCertificates();
  const cert = certs[header.kid];
  if (!cert) {
    throw new Error(`Public key not found for kid: ${header.kid}`);
  }

  const signedContent = `${rawHeader}.${rawPayload}`;
  const signatureBuffer = Buffer.from(rawSignature.replace(/-/g, '+').replace(/_/g, '/'), 'base64');

  const verifier = crypto.createVerify('RSA-SHA256');
  verifier.update(signedContent);
  const isValid = verifier.verify(cert, signatureBuffer);

  if (!isValid) {
    throw new Error('Cryptographic signature verification failed');
  }

  return payload;
}

/**
 * Normalizes phone number to standard 10-digit format
 */
function normalizeTo10Digits(phone) {
  if (!phone) return '';
  const digits = String(phone).replace(/\D/g, '');
  return digits.slice(-10);
}

/**
 * Queries Supabase REST API for matching profile
 */
async function lookupSupabaseProfile(phone10, e164Phone, uid, role = 'farmer') {
  if (!SUPABASE_URL || !SUPABASE_KEY) return null;

  try {
    const table = 'profiles';
    // Match by phone (10 digits, E.164) or firebase_uid
    const filter = `or=(phone.eq.${phone10},phone.eq.${encodeURIComponent(e164Phone)},firebase_uid.eq.${uid})`;
    const url = `${SUPABASE_URL}/rest/v1/${table}?${filter}&select=*`;

    const res = await new Promise((resolve, reject) => {
      const u = new URL(url);
      const req = https.request(u, {
        method: 'GET',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        }
      }, (resp) => {
        let b = '';
        resp.on('data', c => { b += c; });
        resp.on('end', () => {
          try {
            resolve({ statusCode: resp.statusCode, data: JSON.parse(b) });
          } catch (e) {
            resolve({ statusCode: resp.statusCode, data: [] });
          }
        });
      });
      req.on('error', reject);
      req.end();
    });

    if (res.statusCode === 200 && Array.isArray(res.data) && res.data.length > 0) {
      // If role specified, prefer profile matching that role
      if (role) {
        const roleMatch = res.data.find(p => p.role === role);
        if (roleMatch) return roleMatch;
      }
      return res.data[0];
    }

    // Also check consumers table if looking for consumer
    if (role === 'consumer') {
      const consumerUrl = `${SUPABASE_URL}/rest/v1/consumers?or=(phone.eq.${phone10},phone.eq.${encodeURIComponent(e164Phone)},firebase_uid.eq.${uid})&select=*`;
      const cRes = await new Promise((resolve, reject) => {
        const u = new URL(consumerUrl);
        const req = https.request(u, {
          method: 'GET',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': `Bearer ${SUPABASE_KEY}`
          }
        }, (resp) => {
          let b = '';
          resp.on('data', c => { b += c; });
          resp.on('end', () => {
            try {
              resolve({ statusCode: resp.statusCode, data: JSON.parse(b) });
            } catch (e) {
              resolve({ statusCode: resp.statusCode, data: [] });
            }
          });
        });
        req.on('error', reject);
        req.end();
      });

      if (cRes.statusCode === 200 && Array.isArray(cRes.data) && cRes.data.length > 0) {
        return cRes.data[0];
      }
    }

    return null;
  } catch (err) {
    console.warn('[Firebase Auth] Supabase lookup error:', err.message);
    return null;
  }
}

/**
 * Links Firebase UID to existing Supabase profile if not already set
 */
async function linkFirebaseUidToProfile(profileId, uid) {
  if (!SUPABASE_URL || !SUPABASE_KEY || !profileId || !uid) return;
  try {
    const url = `${SUPABASE_URL}/rest/v1/profiles?id=eq.${profileId}`;
    const payload = JSON.stringify({
      firebase_uid: uid,
      phone_verified: true,
      updated_at: new Date().toISOString()
    });

    await new Promise((resolve) => {
      const u = new URL(url);
      const req = https.request(u, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        }
      }, (resp) => {
        resp.on('data', () => {});
        resp.on('end', resolve);
      });
      req.on('error', () => resolve());
      req.write(payload);
      req.end();
    });
  } catch (e) {
    // Non-fatal if schema doesn't have firebase_uid yet
  }
}

/**
 * Request Handler
 */
module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method === 'GET') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      service: 'KisanSaathi Firebase ID Token Verification Service',
      projectId: FIREBASE_PROJECT_ID,
      status: 'active',
      algorithm: 'RS256 Google Public Key Cryptography',
      supabaseTarget: SUPABASE_URL
    }, null, 2));
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ error: 'Method Not Allowed' }));
  }

  // Parse Body
  let body = {};
  try {
    if (req.body && typeof req.body === 'object') {
      body = req.body;
    } else {
      const raw = await new Promise((resolve) => {
        let b = '';
        req.on('data', c => { b += c; });
        req.on('end', () => resolve(b));
      });
      body = raw ? JSON.parse(raw) : {};
    }
  } catch (err) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ success: false, error: 'Invalid JSON request body' }));
  }

  const idToken = body.idToken || (req.headers.authorization ? req.headers.authorization.replace(/^Bearer\s+/i, '') : '');
  const role = (body.role || 'farmer').toLowerCase();

  if (!idToken) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: false,
      error: 'Missing required Firebase idToken in request.'
    }));
  }

  try {
    // Verify token cryptographically
    const payload = await verifyFirebaseIdToken(idToken);
    const uid = payload.sub;
    const rawPhone = payload.phone_number || '';
    const phone10 = normalizeTo10Digits(rawPhone);

    if (!rawPhone || !phone10) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: false,
        error: 'The provided Firebase user does not have a verified phone number.'
      }));
    }

    // Look up existing profile in Supabase
    const profile = await lookupSupabaseProfile(phone10, rawPhone, uid, role);

    if (profile) {
      // Safe update: link firebase_uid if not already linked
      if (!profile.firebase_uid && profile.id) {
        linkFirebaseUidToProfile(profile.id, uid);
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify({
        success: true,
        verified: true,
        matched: true,
        uid,
        phoneNumber: rawPhone,
        phone10,
        role: profile.role || role,
        profile
      }, null, 2));
    }

    // No existing profile found -> eligible for registration
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: true,
      verified: true,
      matched: false,
      uid,
      phoneNumber: rawPhone,
      phone10,
      role,
      message: `Phone number ${rawPhone} successfully verified via Firebase SMS. Ready for registration.`
    }, null, 2));

  } catch (err) {
    console.error('Firebase verification error:', err.message);
    res.statusCode = 401;
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({
      success: false,
      verified: false,
      error: err.message
    }));
  }
};
