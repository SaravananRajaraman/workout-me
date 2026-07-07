const PREFIX = 'workoutme_';
const OLD_PREFIX = 'slamppl_';

// One-time migration from the app's previous name ("Slam PPL"): copy any
// legacy-prefixed values that don't exist under the new prefix yet.
try {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key || !key.startsWith(OLD_PREFIX)) continue;
    const newKey = PREFIX + key.slice(OLD_PREFIX.length);
    if (localStorage.getItem(newKey) === null) {
      const value = localStorage.getItem(key);
      if (value !== null) localStorage.setItem(newKey, value);
    }
  }
} catch {
  // localStorage unavailable — persistence is best-effort anyway
}

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // ignore quota/serialization errors — persistence is best-effort
  }
}

export function loadString(key: string): string | null {
  try {
    return localStorage.getItem(PREFIX + key);
  } catch {
    return null;
  }
}

export function saveString(key: string, value: string): void {
  try {
    localStorage.setItem(PREFIX + key, value);
  } catch {
    // ignore
  }
}
