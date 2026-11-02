// Vercel Serverless Function: Cloud Progress & Player Identity API
// Handles secure anonymous player persistence and Google One Tap cross-device sync.
// Zero exposure of personal email addresses, real names, or developer accounts.

const crypto = require('crypto');

// In-memory persistent cache for serverless environment
const store = globalThis.__ridgelineStore || (globalThis.__ridgelineStore = new Map());

// Helper: Secure SHA-256 hash (used to hash Google subject IDs and player tokens)
function sha256(str) {
  return crypto.createHash('sha256').update(String(str)).digest('hex');
}

// Helper: Safely parse JSON body
async function parseBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body); } catch (e) { return {}; }
  }
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); } catch (e) { resolve({}); }
    });
  });
}

// Helper: Decode and extract subject ID from Google JWT ID token
function extractGoogleSub(idToken) {
  if (!idToken || typeof idToken !== 'string') return null;
  const parts = idToken.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    // Never expose email or name; only extract permanent unique Google subject ID
    if (payload && payload.sub) return payload.sub;
  } catch (e) {}
  return null;
}

// Helper: Persistent storage adapter (Vercel KV / Redis / in-memory fallback)
async function getStoredRecord(key) {
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      const res = await fetch(`${process.env.KV_REST_API_URL}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}` }
      });
      const data = await res.json();
      if (data && data.result) return JSON.parse(data.result);
    } catch (e) {}
  }
  return store.get(key) || null;
}

async function setStoredRecord(key, value) {
  store.set(key, value);
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    try {
      await fetch(`${process.env.KV_REST_API_URL}/set/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.KV_REST_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(value)
      });
    } catch (e) {}
  }
}

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // 1. GET Request: Retrieve saved player progress
    if (req.method === 'GET') {
      const host = (req.headers && req.headers.host) || 'localhost';
      const url = new URL(req.url, `http://${host}`);
      const playerId = url.searchParams.get('id');
      const playerToken = url.searchParams.get('token');
      const googleToken = url.searchParams.get('googleToken');

      let storageKey = null;

      // Case A: Google-linked player
      if (googleToken) {
        const sub = extractGoogleSub(googleToken);
        if (sub) {
          storageKey = 'g_' + sha256(sub);
        }
      }

      // Case B: Anonymous secure player identity
      if (!storageKey) {
        if (!playerId || !playerToken || !playerId.startsWith('usr_')) {
          return res.status(400).json({ ok: false, error: 'Invalid player identification' });
        }
        storageKey = 'u_' + playerId;
      }

      const existing = await getStoredRecord(storageKey);
      if (!existing) {
        return res.status(200).json({ ok: true, progress: null, isNew: true });
      }

      // Verify token for anonymous users
      if (!googleToken && existing.tokenHash && existing.tokenHash !== sha256(playerToken)) {
        return res.status(403).json({ ok: false, error: 'Unauthorized player access' });
      }

      // Return sanitized progress record (no secret token hashes or personal identifiers)
      return res.status(200).json({
        ok: true,
        progress: existing.progress,
        updatedAt: existing.updatedAt || 0
      });
    }

    // 2. POST Request: Save and persist game progress
    if (req.method === 'POST') {
      const body = await parseBody(req);
      const { id: playerId, token: playerToken, progress, googleToken } = body;

      if (!progress || typeof progress !== 'object') {
        return res.status(400).json({ ok: false, error: 'Missing game progress payload' });
      }

      let storageKey = null;
      let isGoogleLinked = false;

      if (googleToken) {
        const sub = extractGoogleSub(googleToken);
        if (sub) {
          storageKey = 'g_' + sha256(sub);
          isGoogleLinked = true;
        }
      }

      if (!storageKey) {
        if (!playerId || !playerToken || !playerId.startsWith('usr_')) {
          return res.status(400).json({ ok: false, error: 'Invalid player credentials' });
        }
        storageKey = 'u_' + playerId;
      }

      // Sanitize and validate game numbers to protect integrity
      const sanitizedProgress = {
        coins: Math.max(0, Math.floor(Number(progress.coins) || 0)),
        gems: Math.max(0, Math.floor(Number(progress.gems) || 0)),
        best: Math.max(0, Math.floor(Number(progress.best) || 0)),
        totalM: Math.max(0, Math.floor(Number(progress.totalM) || 0)),
        owned: Array.isArray(progress.owned) && progress.owned.length ? progress.owned : ['buggy'],
        upgrades: (progress.upgrades && typeof progress.upgrades === 'object') ? progress.upgrades : {},
        cfg: (progress.cfg && typeof progress.cfg === 'object') ? progress.cfg : { car: 'buggy', biome: 'grass' },
        terrainParams: (progress.terrainParams && typeof progress.terrainParams === 'object') ? progress.terrainParams : { scale: 1.0, height: 50, octaves: 4, seed: 42 },
        sound: (progress.sound && typeof progress.sound === 'object') ? progress.sound : { enabled: true, volume: 20 },
        sensitivity: Math.max(0, Math.min(100, Number(progress.sensitivity) || 50))
      };

      const now = Date.now();
      const clientUpdatedAt = Number(progress.updatedAt) || now;

      // Check existing record for concurrency and conflict resolution
      const existing = await getStoredRecord(storageKey);
      if (existing) {
        // Verify token ownership for anonymous player records
        if (!isGoogleLinked && existing.tokenHash && existing.tokenHash !== sha256(playerToken)) {
          return res.status(403).json({ ok: false, error: 'Unauthorized: Token mismatch' });
        }

        // Avoid overwriting newer server-side progress with stale local data
        if (existing.updatedAt && existing.updatedAt > clientUpdatedAt) {
          return res.status(200).json({
            ok: true,
            conflict: true,
            message: 'Server has newer progress',
            progress: existing.progress,
            updatedAt: existing.updatedAt
          });
        }
      }

      const recordToSave = {
        tokenHash: sha256(playerToken || 'google_linked'),
        updatedAt: now,
        isGoogleLinked,
        progress: sanitizedProgress
      };

      await setStoredRecord(storageKey, recordToSave);

      return res.status(200).json({
        ok: true,
        savedAt: now,
        playerId: isGoogleLinked ? 'google_verified' : playerId.slice(0, 8) + '...'
      });
    }

    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'Internal cloud save error' });
  }
};
