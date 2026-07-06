const GIS_SRC = 'https://accounts.google.com/gsi/client';

export const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/userinfo.email',
].join(' ');

interface TokenResponse {
  access_token?: string;
  error?: string;
  error_description?: string;
}

interface TokenClient {
  requestAccessToken(opts?: { prompt?: string }): void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string;
            scope: string;
            callback: (resp: TokenResponse) => void;
          }): TokenClient;
          revoke(token: string, done?: () => void): void;
        };
      };
    };
  }
}

let gisLoadPromise: Promise<void> | null = null;

function loadGis(): Promise<void> {
  if (gisLoadPromise) return gisLoadPromise;
  gisLoadPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const existing = document.getElementById('gis-script') as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Failed to load Google Identity Services')));
      return;
    }
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.id = 'gis-script';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
    document.head.appendChild(script);
  });
  return gisLoadPromise;
}

let tokenClient: TokenClient | null = null;
let currentAccessToken: string | null = null;

export function isGoogleConfigured(): boolean {
  return Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID);
}

export function getCachedAccessToken(): string | null {
  return currentAccessToken;
}

async function ensureTokenClient(): Promise<TokenClient> {
  await loadGis();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('Missing VITE_GOOGLE_CLIENT_ID — set it in .env.local (see .env.example).');
  }
  if (tokenClient) return tokenClient;
  return new Promise((resolve) => {
    let client!: TokenClient;
    client = window.google!.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_SCOPES,
      callback: () => {
        // per-call callback is overridden by requestAccessTokenFlow below
      },
    });
    tokenClient = client;
    resolve(client);
  });
}

/** Requests an access token. `interactive: false` tries a silent (no-prompt) refresh first. */
export function requestAccessToken(interactive: boolean): Promise<string> {
  return ensureTokenClient().then(
    () =>
      new Promise<string>((resolve, reject) => {
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        // Re-init with a fresh callback per request since GIS only supports one callback per client.
        const client = window.google!.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: GOOGLE_SCOPES,
          callback: (resp: TokenResponse) => {
            if (resp.error || !resp.access_token) {
              reject(new Error(resp.error_description || resp.error || 'Google sign-in failed'));
              return;
            }
            currentAccessToken = resp.access_token;
            resolve(resp.access_token);
          },
        });
        client.requestAccessToken({ prompt: interactive ? 'consent' : '' });
      }),
  );
}

export async function fetchGoogleEmail(accessToken: string): Promise<string | null> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { email?: string };
  return data.email ?? null;
}

export function revokeToken(): Promise<void> {
  return new Promise((resolve) => {
    if (!currentAccessToken || !window.google?.accounts?.oauth2) {
      currentAccessToken = null;
      resolve();
      return;
    }
    window.google.accounts.oauth2.revoke(currentAccessToken, () => {
      currentAccessToken = null;
      resolve();
    });
  });
}
