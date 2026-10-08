const DEFAULT_USERNAME = import.meta.env.VITE_ADMIN_USERNAME ?? 'admin';
const DEFAULT_HASH = import.meta.env.VITE_ADMIN_HASH ?? 'bb8478c6fb683dbef46192ef4919c7e5b1a8f95a9aef0f62888643fcdb489c41';
const CREDS_KEY = 'cdhl_admin_creds';
const SESSION_KEY = 'cdhl_admin_session';
const ATTEMPTS_KEY = 'cdhl_admin_attempts';
const LOCKOUT_KEY = 'cdhl_admin_lockout';
const SESSION_TTL = 8 * 60 * 60 * 1000;
const LOCKOUT_TTL = 15 * 60 * 1000;
const MAX_ATTEMPTS = 3;

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function getCredentials(): { username: string; hash: string } {
  try {
    const raw = localStorage.getItem(CREDS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* fall through */ }
  return { username: DEFAULT_USERNAME, hash: DEFAULT_HASH };
}

export async function login(username: string, password: string): Promise<{ ok: boolean; error?: string }> {
  const lockout = localStorage.getItem(LOCKOUT_KEY);
  if (lockout) {
    const remaining = parseInt(lockout) - Date.now();
    if (remaining > 0) {
      const mins = Math.ceil(remaining / 60000);
      return { ok: false, error: `Too many attempts. Try again in ${mins} min.` };
    }
    localStorage.removeItem(LOCKOUT_KEY);
    localStorage.removeItem(ATTEMPTS_KEY);
  }

  const creds = getCredentials();
  const hash = await sha256(password);
  if (username === creds.username && hash === creds.hash) {
    localStorage.removeItem(ATTEMPTS_KEY);
    localStorage.removeItem(LOCKOUT_KEY);
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username, expires: Date.now() + SESSION_TTL }));
    return { ok: true };
  }

  const attempts = parseInt(localStorage.getItem(ATTEMPTS_KEY) ?? '0') + 1;
  if (attempts >= MAX_ATTEMPTS) {
    localStorage.setItem(LOCKOUT_KEY, String(Date.now() + LOCKOUT_TTL));
    localStorage.removeItem(ATTEMPTS_KEY);
    return { ok: false, error: 'Too many failed attempts. Locked for 15 minutes.' };
  }
  localStorage.setItem(ATTEMPTS_KEY, String(attempts));
  return { ok: false, error: `Invalid credentials. ${MAX_ATTEMPTS - attempts} attempt(s) remaining.` };
}

export async function changeCredentials(
  currentPassword: string,
  newUsername: string,
  newPassword: string,
): Promise<{ ok: boolean; error?: string }> {
  const creds = getCredentials();
  const currentHash = await sha256(currentPassword);
  if (currentHash !== creds.hash) {
    return { ok: false, error: 'Current password is incorrect.' };
  }
  const newHash = await sha256(newPassword);
  localStorage.setItem(CREDS_KEY, JSON.stringify({ username: newUsername, hash: newHash }));
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ username: newUsername, expires: Date.now() + SESSION_TTL }));
  return { ok: true };
}

export function isAuthenticated(): boolean {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const { expires } = JSON.parse(raw);
    return Date.now() < expires;
  } catch {
    return false;
  }
}

export function getAdminUser(): string {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return 'Admin';
    return JSON.parse(raw).username;
  } catch {
    return 'Admin';
  }
}

export function logout(): void {
  sessionStorage.removeItem(SESSION_KEY);
}
