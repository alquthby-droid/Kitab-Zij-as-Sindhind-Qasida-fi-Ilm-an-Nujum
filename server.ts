import 'dotenv/config';
import crypto from 'crypto';
import fs from 'fs';
import os from 'os';
import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PROD = process.env.NODE_ENV === 'production';
const APPLET_ID = '7d916580-ae0d-474a-90e1-ecf48060f9ee';
const SID_V2_BASE = 'https://api.s.id/v2';
const SID_V1_BASE = 'https://api.s.id/v1';

// Sliding-window in-memory rate limiter per client IP (30 req / 60s)
const RATE_LIMIT_MAX = 30;
const RATE_LIMIT_WINDOW_MS = 60_000;
const rateBuckets = new Map<string, number[]>();

// Built-in Zero-Config Auto Shortlink Store (used automatically when SID_API_KEY is not set)
interface AutoShortlinkRecord {
  id: string;
  slug: string;
  shortUrl: string;
  longUrl: string;
  clicks: number;
  createdAt: string;
  updatedAt: string;
}

const AUTO_STORE_PATH = path.join(os.tmpdir(), `sindhind-proxy-links-${APPLET_ID}.json`);
const autoLinksBySlug = new Map<string, AutoShortlinkRecord>();

function loadAutoStore(): void {
  try {
    if (!fs.existsSync(AUTO_STORE_PATH)) return;
    const raw = fs.readFileSync(AUTO_STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (item && typeof item.slug === 'string' && typeof item.longUrl === 'string') {
          autoLinksBySlug.set(item.slug, {
            id: String(item.id || `auto_${item.slug}`),
            slug: item.slug,
            shortUrl: String(item.shortUrl || ''),
            longUrl: item.longUrl,
            clicks: typeof item.clicks === 'number' ? item.clicks : 0,
            createdAt: String(item.createdAt || new Date().toISOString()),
            updatedAt: String(item.updatedAt || item.createdAt || new Date().toISOString()),
          });
        }
      }
    }
  } catch {
    // Fallback cleanly to empty in-memory store
  }
}

function persistAutoStore(): void {
  try {
    const list = Array.from(autoLinksBySlug.values());
    fs.writeFileSync(AUTO_STORE_PATH, JSON.stringify(list, null, 2), 'utf8');
  } catch {
    // Ignore read-only tmpfs edge cases; in-memory store stays active
  }
}

loadAutoStore();

function getClientIp(req: Request): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.trim()) {
    return fwd.split(',')[0].trim();
  }
  return req.socket.remoteAddress || 'unknown';
}

function getSuggestedPublicAppUrl(req?: Request): string {
  const envUrl = process.env.APP_URL?.trim() || '';
  if (envUrl) {
    return envUrl.includes('ais-dev-') ? envUrl.replace('ais-dev-', 'ais-pre-') : envUrl;
  }
  if (req) {
    const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
    const host = (req.headers['x-forwarded-host'] as string) || req.get('host') || '';
    if (host) {
      const origin = `${proto}://${host}`;
      return origin.includes('ais-dev-') ? origin.replace('ais-dev-', 'ais-pre-') : origin;
    }
  }
  return '';
}

function sanitizeSlug(raw?: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw
    .trim()
    .replace(/^https?:\/\/(www\.)?s\.id\//i, '')
    .replace(/^\/?go\//i, '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
}

function generateAutoSlug(): string {
  return crypto.randomBytes(4).toString('base64url').replace(/[^a-zA-Z0-9]/g, '').slice(0, 6).toLowerCase();
}

function sanitizeLinkId(raw?: unknown): string {
  if (typeof raw !== 'string') return '';
  return raw.trim().replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 64);
}

function isPrivateOrLocalHostname(hostname: string): boolean {
  const host = hostname.toLowerCase();
  if (
    host === 'localhost' ||
    host === '0.0.0.0' ||
    host === '::1' ||
    host === '[::1]' ||
    host.endsWith('.local') ||
    host.endsWith('.internal')
  ) {
    return true;
  }
  // Reject IPv4 private / link-local / loopback ranges (SSRF guard)
  if (/^(127\.|10\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/.test(host)) {
    return true;
  }
  return false;
}

function validateAndNormalizeTargetUrl(
  rawUrl: unknown,
  fallbackPublicUrl: string
): { ok: true; url: string; normalizedFromEditor: boolean } | { ok: false; message: string } {
  if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
    if (fallbackPublicUrl) {
      return { ok: true, url: fallbackPublicUrl, normalizedFromEditor: false };
    }
    return { ok: false, message: 'URL tujuan wajib diisi.' };
  }
  const trimmed = rawUrl.trim();

  // Auto-convert AI Studio editor URL for this applet to the public Shared App URL
  if (
    trimmed.includes(`aistudio.google.com/apps/${APPLET_ID}`) ||
    trimmed.includes('aistudio.google.com/app/')
  ) {
    if (fallbackPublicUrl) {
      return { ok: true, url: fallbackPublicUrl, normalizedFromEditor: true };
    }
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    return {
      ok: false,
      message: 'Format URL tujuan tidak valid. Pastikan diawali dengan https:// atau http://.',
    };
  }

  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
    return {
      ok: false,
      message: 'Hanya protokol https:// atau http:// yang diizinkan oleh Proxy Aman s.id.',
    };
  }

  if (isPrivateOrLocalHostname(parsed.hostname)) {
    return {
      ok: false,
      message:
        'Alamat lokal/privat (localhost atau IP internal) diblokir oleh pelindung SSRF Proxy Aman s.id.',
    };
  }

  return { ok: true, url: parsed.toString(), normalizedFromEditor: false };
}

function safeTokenEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function extractShortUrlFromSidResponse(
  data: unknown,
  fallbackSlug?: string
): { shortUrl: string | null; slug: string | null; rawId: string | null } {
  const root = (data && typeof data === 'object' ? data : {}) as Record<string, unknown>;
  const nested =
    root.data && typeof root.data === 'object'
      ? (root.data as Record<string, unknown>)
      : root;

  const directUrl =
    (typeof nested.short_url === 'string' && nested.short_url) ||
    (typeof nested.shortUrl === 'string' && nested.shortUrl) ||
    (typeof root.short_url === 'string' && root.short_url) ||
    null;

  const rawSlug =
    (typeof nested.short === 'string' && nested.short) ||
    (typeof nested.slug === 'string' && nested.slug) ||
    (typeof nested.custom_slug === 'string' && nested.custom_slug) ||
    (typeof root.short === 'string' && root.short) ||
    (typeof root.slug === 'string' && root.slug) ||
    fallbackSlug ||
    null;

  const rawId =
    (typeof nested.id === 'string' || typeof nested.id === 'number'
      ? String(nested.id)
      : null) ||
    (typeof root.id === 'string' || typeof root.id === 'number' ? String(root.id) : null);

  if (directUrl) {
    const cleanUrl = directUrl.startsWith('http') ? directUrl : `https://${directUrl}`;
    const derivedSlug = rawSlug || cleanUrl.replace(/^https?:\/\/(www\.)?s\.id\//i, '');
    return { shortUrl: cleanUrl, slug: derivedSlug, rawId };
  }

  if (rawSlug) {
    const cleanSlug = rawSlug.replace(/^https?:\/\/(www\.)?s\.id\//i, '');
    return { shortUrl: `https://s.id/${cleanSlug}`, slug: cleanSlug, rawId };
  }

  return { shortUrl: null, slug: null, rawId };
}

function getSidCredentials(): {
  authMode: 'v2_bearer' | 'v1_legacy' | 'auto_builtin';
  apiKey: string;
  authId: string;
  authKey: string;
} {
  const apiKey = process.env.SID_API_KEY?.trim() || '';
  const authId = process.env.SID_AUTH_ID?.trim() || '';
  const authKey = process.env.SID_AUTH_KEY?.trim() || '';

  if (apiKey) {
    return { authMode: 'v2_bearer', apiKey, authId: '', authKey: '' };
  }
  if (authId && authKey) {
    return { authMode: 'v1_legacy', apiKey: '', authId, authKey };
  }
  return { authMode: 'auto_builtin', apiKey: '', authId: '', authKey: '' };
}

/**
 * Security middleware for all /api/sid/* secure proxy routes:
 * - Hardened security & no-store headers
 * - Built-in zero-config CORS allowlist (AI Studio, Google Apps Script, same-origin)
 * - Optional X-Proxy-Token gate if SID_PROXY_TOKEN is explicitly configured
 * - Sliding-window per-IP rate limiting
 */
function sidProxySecurityMiddleware(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('X-Proxy-Service', 'Zij-as-Sindhind-Secure-SID-Proxy');

  const origin = req.headers.origin;
  const host = req.get('host') || '';
  const isSameOrigin = !origin || origin.includes(host);

  const defaultAllowedOrigins = [
    'https://aistudio.google.com',
    'https://script.google.com',
    'https://script.googleusercontent.com',
  ];
  const envAllowedOrigins = (process.env.SID_ALLOWED_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  const allowedOrigins = [...defaultAllowedOrigins, ...envAllowedOrigins];

  const isAllowedExternalOrigin =
    Boolean(origin) &&
    (allowedOrigins.includes('*') ||
      allowedOrigins.includes(origin!) ||
      origin!.endsWith('.run.app'));

  if (origin && (isSameOrigin || isAllowedExternalOrigin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Proxy-Token');
  }

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Optional external caller token gate (never blocks same-origin app UI or /health /status)
  const configuredProxyToken = process.env.SID_PROXY_TOKEN?.trim();
  const isPublicHealthOrStatus = req.path === '/health' || req.path === '/status';
  if (configuredProxyToken && !isSameOrigin && !isPublicHealthOrStatus) {
    const provided = String(req.headers['x-proxy-token'] || '').trim();
    if (!provided || !safeTokenEquals(provided, configuredProxyToken)) {
      res.status(401).json({
        success: false,
        code: 'PROXY_TOKEN_INVALID',
        message: 'Header X-Proxy-Token tidak valid atau tidak disertakan untuk akses eksternal.',
      });
      return;
    }
  }

  // Sliding-window per-IP rate limiting
  const ip = getClientIp(req);
  const now = Date.now();
  const recent = (rateBuckets.get(ip) || []).filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
  const remaining = Math.max(0, RATE_LIMIT_MAX - recent.length);

  res.setHeader('X-RateLimit-Limit', String(RATE_LIMIT_MAX));
  res.setHeader('X-RateLimit-Remaining', String(Math.max(0, remaining - 1)));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil((now + RATE_LIMIT_WINDOW_MS) / 1000)));

  if (recent.length >= RATE_LIMIT_MAX) {
    res.status(429).json({
      success: false,
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Terlalu banyak permintaan ke Proxy s.id (maksimal 30 permintaan/menit). Tunggu sebentar lalu coba lagi.',
    });
    return;
  }

  recent.push(now);
  rateBuckets.set(ip, recent);
  next();
}

async function handlePublishShortlink(req: Request, res: Response): Promise<void> {
  try {
    const body = (req.body || {}) as {
      longUrl?: string;
      long_url?: string;
      customSlug?: string;
      custom_slug?: string;
    };

    const rawTarget = body.longUrl ?? body.long_url;
    const rawSlug = body.customSlug ?? body.custom_slug;
    const fallbackPublicUrl = getSuggestedPublicAppUrl(req);
    const validated = validateAndNormalizeTargetUrl(rawTarget, fallbackPublicUrl);

    if (!validated.ok) {
      res.status(400).json({
        success: false,
        code: 'INVALID_URL',
        message: validated.message,
      });
      return;
    }

    const cleanedLongUrl = validated.url;
    const cleanedSlug = sanitizeSlug(rawSlug);
    const creds = getSidCredentials();

    // 1. Official s.id API v2 (when SID_API_KEY is configured in server Secrets)
    if (creds.authMode === 'v2_bearer') {
      const payload: Record<string, string> = { long_url: cleanedLongUrl };
      if (cleanedSlug) payload.custom_slug = cleanedSlug;

      const upstream = await fetch(`${SID_V2_BASE}/links`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${creds.apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const rawText = await upstream.text();
      let parsed: Record<string, unknown> = {};
      try {
        parsed = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : {};
      } catch {
        parsed = { raw: rawText };
      }

      if (!upstream.ok) {
        const upstreamMsg =
          (typeof parsed.message === 'string' && parsed.message) ||
          (typeof parsed.error === 'string' && parsed.error) ||
          `Server s.id mengembalikan status ${upstream.status}.`;

        let friendly = upstreamMsg;
        if (upstream.status === 401 || upstream.status === 403) {
          friendly =
            'SID_API_KEY ditolak oleh server s.id (401/403). Periksa kembali API Key Anda di Dashboard s.id -> Developer.';
        } else if (upstream.status === 409 || upstream.status === 422) {
          friendly = `Alias "s.id/${cleanedSlug}" kemungkinan sudah dipakai atau tidak memenuhi syarat s.id (${upstreamMsg}). Coba ganti akhiran alias.`;
        }

        res.status(upstream.status).json({
          success: false,
          code: 'SID_UPSTREAM_ERROR',
          status: upstream.status,
          message: friendly,
        });
        return;
      }

      const extracted = extractShortUrlFromSidResponse(parsed, cleanedSlug || undefined);
      if (!extracted.shortUrl) {
        res.status(502).json({
          success: false,
          code: 'SID_UNEXPECTED_RESPONSE',
          message: 'Tautan diproses, tetapi format respons short_url dari s.id tidak dikenali.',
        });
        return;
      }

      res.json({
        success: true,
        authMode: 'v2_bearer',
        shortUrl: extracted.shortUrl,
        slug: extracted.slug,
        longUrl: cleanedLongUrl,
        normalizedFromEditor: validated.normalizedFromEditor,
        rawId: extracted.rawId,
        createdAt: new Date().toISOString(),
      });
      return;
    }

    // 2. Legacy s.id API v1 (when SID_AUTH_ID + SID_AUTH_KEY are configured)
    if (creds.authMode === 'v1_legacy') {
      const v1Body: Record<string, string> = { long_url: cleanedLongUrl };
      if (cleanedSlug) v1Body.short = cleanedSlug;

      const upstreamV1 = await fetch(`${SID_V1_BASE}/links`, {
        method: 'POST',
        headers: {
          'X-Auth-Id': creds.authId,
          'X-Auth-Key': creds.authKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(v1Body),
      });

      const rawV1Text = await upstreamV1.text();
      let parsedV1: Record<string, unknown> = {};
      try {
        parsedV1 = rawV1Text ? (JSON.parse(rawV1Text) as Record<string, unknown>) : {};
      } catch {
        parsedV1 = { raw: rawV1Text };
      }

      if (!upstreamV1.ok) {
        const msg =
          (typeof parsedV1.message === 'string' && parsedV1.message) ||
          `Server s.id v1 mengembalikan status ${upstreamV1.status}.`;
        res.status(upstreamV1.status).json({
          success: false,
          code: 'SID_UPSTREAM_ERROR',
          message: msg,
        });
        return;
      }

      const extractedV1 = extractShortUrlFromSidResponse(parsedV1, cleanedSlug || undefined);
      if (!extractedV1.shortUrl) {
        res.status(502).json({
          success: false,
          code: 'SID_UNEXPECTED_RESPONSE',
          message: 'Format respons s.id v1 tidak berisi short_url.',
        });
        return;
      }

      res.json({
        success: true,
        authMode: 'v1_legacy',
        shortUrl: extractedV1.shortUrl,
        slug: extractedV1.slug,
        longUrl: cleanedLongUrl,
        normalizedFromEditor: validated.normalizedFromEditor,
        rawId: extractedV1.rawId,
        createdAt: new Date().toISOString(),
      });
      return;
    }

    // 3. Zero-Config Built-In Auto Shortlink Mode (works immediately without any env secrets!)
    const finalSlug = cleanedSlug || generateAutoSlug();
    const baseOrigin = (fallbackPublicUrl || '').replace(/\/$/, '');
    const shortUrl = baseOrigin ? `${baseOrigin}/go/${finalSlug}` : `/go/${finalSlug}`;
    const nowIso = new Date().toISOString();
    const existing = autoLinksBySlug.get(finalSlug);

    const record: AutoShortlinkRecord = {
      id: existing?.id || `auto_${finalSlug}`,
      slug: finalSlug,
      shortUrl,
      longUrl: cleanedLongUrl,
      clicks: existing?.clicks ?? 0,
      createdAt: existing?.createdAt || nowIso,
      updatedAt: nowIso,
    };

    autoLinksBySlug.set(finalSlug, record);
    persistAutoStore();

    res.json({
      success: true,
      authMode: 'auto_builtin',
      shortUrl: record.shortUrl,
      slug: record.slug,
      longUrl: record.longUrl,
      normalizedFromEditor: validated.normalizedFromEditor,
      rawId: record.id,
      createdAt: record.createdAt,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      code: 'SID_PROXY_ERROR',
      message:
        err instanceof Error
          ? `Gagal memproses tautan melalui Proxy Aman: ${err.message}`
          : 'Terjadi kesalahan jaringan saat memproses tautan.',
    });
  }
}

async function startServer() {
  const app = express();
  app.disable('x-powered-by');
  const httpServer = http.createServer(app);
  app.use(express.json({ limit: '512kb' }));

  // ============================================================================
  // BUILT-IN AUTO SHORTLINK REDIRECT ENDPOINT (/go/:slug)
  // ============================================================================
  app.get('/go/:slug', (req, res) => {
    const slug = sanitizeSlug(req.params.slug);
    const entry = slug ? autoLinksBySlug.get(slug) : undefined;

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    if (!entry) {
      if (req.headers.accept?.includes('application/json')) {
        res.status(404).json({
          success: false,
          code: 'SHORTLINK_NOT_FOUND',
          message: `Tautan pendek /go/${slug || ''} tidak ditemukan.`,
        });
        return;
      }
      res.redirect(302, '/');
      return;
    }

    entry.clicks += 1;
    entry.updatedAt = new Date().toISOString();
    autoLinksBySlug.set(slug, entry);
    persistAutoStore();

    res.redirect(302, entry.longUrl);
  });

  // ============================================================================
  // PROXY SERVER AMAN UNTUK API s.id (/api/sid/*)
  // ============================================================================
  const sidRouter = express.Router();
  sidRouter.use(sidProxySecurityMiddleware);

  // Health check endpoint
  sidRouter.get('/health', (req, res) => {
    const creds = getSidCredentials();
    const publicBase = getSuggestedPublicAppUrl(req);
    res.json({
      ok: true,
      service: 'Proxy Server Aman API s.id',
      appletId: APPLET_ID,
      upstream:
        creds.authMode === 'v2_bearer'
          ? SID_V2_BASE
          : creds.authMode === 'v1_legacy'
          ? SID_V1_BASE
          : 'auto-builtin-shortener',
      configured: true,
      sidApiConnected: creds.authMode !== 'auto_builtin',
      authMode: creds.authMode,
      proxyBaseUrl: publicBase ? `${publicBase.replace(/\/$/, '')}/api/sid` : '/api/sid',
      security: {
        rateLimitPerMinute: RATE_LIMIT_MAX,
        ssrfGuard: true,
        noStoreCache: true,
        externalProxyTokenEnabled: Boolean(process.env.SID_PROXY_TOKEN?.trim()),
      },
      timestamp: new Date().toISOString(),
    });
  });

  // Status & metadata endpoint
  sidRouter.get('/status', (req, res) => {
    const creds = getSidCredentials();
    const suggestedPublicUrl = getSuggestedPublicAppUrl(req);
    const proxyBaseUrl = suggestedPublicUrl
      ? `${suggestedPublicUrl.replace(/\/$/, '')}/api/sid`
      : '/api/sid';

    res.json({
      configured: true,
      sidApiConnected: creds.authMode !== 'auto_builtin',
      authMode: creds.authMode,
      appletId: APPLET_ID,
      upstreamBase:
        creds.authMode === 'v2_bearer'
          ? SID_V2_BASE
          : creds.authMode === 'v1_legacy'
          ? SID_V1_BASE
          : `${suggestedPublicUrl.replace(/\/$/, '')}/go`,
      suggestedPublicUrl,
      proxyBaseUrl,
      security: {
        rateLimitPerMinute: RATE_LIMIT_MAX,
        ssrfGuard: true,
        noStoreCache: true,
        externalProxyTokenEnabled: Boolean(process.env.SID_PROXY_TOKEN?.trim()),
      },
      endpoints: [
        'GET /api/sid/health',
        'GET /api/sid/status',
        'POST /api/sid/publish',
        'POST /api/sid/links',
        'GET /api/sid/links',
        'DELETE /api/sid/links/:id',
        'GET /go/:slug',
      ],
    });
  });

  // Create shortlink (both /publish and RESTful /links)
  sidRouter.post('/publish', (req, res) => {
    void handlePublishShortlink(req, res);
  });
  sidRouter.post('/links', (req, res) => {
    void handlePublishShortlink(req, res);
  });

  // List existing links (upstream s.id API if key configured, or built-in auto store)
  sidRouter.get('/links', async (req, res) => {
    try {
      const creds = getSidCredentials();
      const page = Math.max(1, Math.min(100, Number(req.query.page) || 1));
      const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 15));

      if (creds.authMode === 'auto_builtin') {
        const all = Array.from(autoLinksBySlug.values()).sort((a, b) =>
          b.updatedAt.localeCompare(a.updatedAt)
        );
        const start = (page - 1) * limit;
        const sliced = all.slice(start, start + limit);
        res.json({
          success: true,
          authMode: 'auto_builtin',
          page,
          limit,
          links: sliced.map((item) => ({
            id: item.id,
            shortUrl: item.shortUrl,
            slug: item.slug,
            longUrl: item.longUrl,
            clicks: item.clicks,
            createdAt: item.createdAt,
          })),
        });
        return;
      }

      const upstreamUrl =
        creds.authMode === 'v2_bearer'
          ? `${SID_V2_BASE}/links?page=${page}&limit=${limit}`
          : `${SID_V1_BASE}/links?page=${page}&limit=${limit}`;

      const headers: Record<string, string> =
        creds.authMode === 'v2_bearer'
          ? {
              Authorization: `Bearer ${creds.apiKey}`,
              Accept: 'application/json',
            }
          : {
              'X-Auth-Id': creds.authId,
              'X-Auth-Key': creds.authKey,
              Accept: 'application/json',
            };

      const upstream = await fetch(upstreamUrl, { method: 'GET', headers });
      const rawText = await upstream.text();
      let parsed: Record<string, unknown> = {};
      try {
        parsed = rawText ? (JSON.parse(rawText) as Record<string, unknown>) : {};
      } catch {
        parsed = { raw: rawText };
      }

      if (!upstream.ok) {
        res.status(upstream.status).json({
          success: false,
          code: 'SID_UPSTREAM_ERROR',
          message:
            (typeof parsed.message === 'string' && parsed.message) ||
            `Gagal memuat daftar tautan dari s.id (HTTP ${upstream.status}).`,
        });
        return;
      }

      const rawList = Array.isArray(parsed.data)
        ? parsed.data
        : Array.isArray(parsed.links)
        ? parsed.links
        : Array.isArray(parsed)
        ? parsed
        : [];

      const links = rawList
        .map((item) => {
          const rec = (item && typeof item === 'object' ? item : {}) as Record<string, unknown>;
          const extracted = extractShortUrlFromSidResponse(rec);
          return {
            id: extracted.rawId || '',
            shortUrl: extracted.shortUrl || '',
            slug: extracted.slug || '',
            longUrl:
              (typeof rec.long_url === 'string' && rec.long_url) ||
              (typeof rec.longUrl === 'string' && rec.longUrl) ||
              '',
            clicks:
              typeof rec.clicks === 'number'
                ? rec.clicks
                : typeof rec.count === 'number'
                ? rec.count
                : undefined,
            createdAt:
              (typeof rec.created_at === 'string' && rec.created_at) ||
              (typeof rec.createdAt === 'string' && rec.createdAt) ||
              '',
          };
        })
        .filter((l) => Boolean(l.shortUrl));

      res.json({
        success: true,
        authMode: creds.authMode,
        page,
        limit,
        links,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        code: 'SID_PROXY_ERROR',
        message:
          err instanceof Error
            ? `Gagal memuat daftar tautan dari api.s.id: ${err.message}`
            : 'Gagal memuat daftar tautan dari api.s.id.',
      });
    }
  });

  // Delete a shortlink by ID
  sidRouter.delete('/links/:id', async (req, res) => {
    try {
      const linkId = sanitizeLinkId(req.params.id);
      if (!linkId) {
        res.status(400).json({
          success: false,
          code: 'INVALID_LINK_ID',
          message: 'ID tautan tidak valid.',
        });
        return;
      }

      const creds = getSidCredentials();
      if (creds.authMode === 'auto_builtin') {
        let deletedSlug: string | null = null;
        for (const [slug, rec] of autoLinksBySlug.entries()) {
          if (rec.id === linkId || slug === linkId) {
            autoLinksBySlug.delete(slug);
            deletedSlug = slug;
            break;
          }
        }
        if (!deletedSlug) {
          res.status(404).json({
            success: false,
            code: 'SHORTLINK_NOT_FOUND',
            message: `Tautan ID ${linkId} tidak ditemukan.`,
          });
          return;
        }
        persistAutoStore();
        res.json({
          success: true,
          deletedId: linkId,
          message: `Tautan /go/${deletedSlug} berhasil dihapus.`,
        });
        return;
      }

      const upstreamUrl =
        creds.authMode === 'v2_bearer'
          ? `${SID_V2_BASE}/links/${encodeURIComponent(linkId)}`
          : `${SID_V1_BASE}/links/${encodeURIComponent(linkId)}`;

      const headers: Record<string, string> =
        creds.authMode === 'v2_bearer'
          ? {
              Authorization: `Bearer ${creds.apiKey}`,
              Accept: 'application/json',
            }
          : {
              'X-Auth-Id': creds.authId,
              'X-Auth-Key': creds.authKey,
              Accept: 'application/json',
            };

      const upstream = await fetch(upstreamUrl, { method: 'DELETE', headers });
      if (!upstream.ok) {
        const errText = await upstream.text();
        res.status(upstream.status).json({
          success: false,
          code: 'SID_UPSTREAM_ERROR',
          message: errText || `Gagal menghapus tautan di s.id (HTTP ${upstream.status}).`,
        });
        return;
      }

      res.json({
        success: true,
        deletedId: linkId,
        message: `Tautan ID ${linkId} berhasil dihapus melalui Proxy Aman s.id.`,
      });
    } catch (err) {
      res.status(500).json({
        success: false,
        code: 'SID_PROXY_ERROR',
        message:
          err instanceof Error
            ? `Gagal menghapus tautan di api.s.id: ${err.message}`
            : 'Gagal menghapus tautan di api.s.id.',
      });
    }
  });

  app.use('/api/sid', sidRouter);

  // Mount Vite middleware in development, or serve built dist/ assets in production
  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : true,
        ws: isHmrDisabled ? false : { server: httpServer },
        watch: isHmrDisabled ? null : {},
      },
      appType: 'spa',
    });

    // When HMR is disabled in middlewareMode, Vite 8 still injects /@vite/client
    // which attempts to open a WebSocket to port 24678. Serve a clean zero-WS
    // client shim that preserves CSS updateStyle/removeStyle and createHotContext.
    if (isHmrDisabled) {
      app.get('/@vite/client', (_req, res) => {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.send(`
const sheetsMap = new Map();
let lastInsertedStyle;

export function updateStyle(id, content) {
  let style = sheetsMap.get(id);
  if (!style) {
    style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('data-vite-dev-id', id);
    style.textContent = content;
    if (!lastInsertedStyle) {
      document.head.appendChild(style);
      setTimeout(() => { lastInsertedStyle = undefined; }, 0);
    } else {
      lastInsertedStyle.insertAdjacentElement('afterend', style);
    }
    lastInsertedStyle = style;
  } else {
    style.textContent = content;
  }
  sheetsMap.set(id, style);
}

export function removeStyle(id) {
  const style = sheetsMap.get(id);
  if (style) {
    document.head.removeChild(style);
    sheetsMap.delete(id);
  }
}

export function createHotContext() {
  return {
    data: {},
    accept() {},
    acceptExports() {},
    dispose() {},
    prune() {},
    decline() {},
    invalidate() {},
    on() {},
    off() {},
    send() {},
  };
}

export function injectQuery(url) {
  return url;
}

export class ErrorOverlay extends (typeof HTMLElement !== 'undefined' ? HTMLElement : Object) {}
`);
      });
    }

    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
