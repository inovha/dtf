import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

const SESSION_COOKIE = 'dtf_session';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Simple hash function for session token
 * In production, use a proper crypto library
 */
function createSessionToken(user: string): string {
  const secret = process.env.SESSION_SECRET || 'dev-secret';
  const data = `${user}:${secret}:${Date.now()}`;
  // Simple base64 encoding - in prod use proper signing
  return Buffer.from(data).toString('base64');
}

function validateSessionToken(token: string): boolean {
  try {
    const secret = process.env.SESSION_SECRET || 'dev-secret';
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parts = decoded.split(':');
    return parts.length >= 2 && parts[1] === secret;
  } catch {
    return false;
  }
}

export async function login(username: string, password: string): Promise<boolean> {
  const adminUser = process.env.ADMIN_USER;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUser || !adminPassword) {
    console.error('Admin credentials not configured');
    return false;
  }

  if (username === adminUser && password === adminPassword) {
    const token = createSessionToken(username);
    const cookieStore = await cookies();
    
    cookieStore.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    });
    
    return true;
  }

  return false;
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  
  if (!token) {
    return false;
  }

  return validateSessionToken(token);
}

export async function requireAuth(): Promise<void> {
  const authenticated = await isAuthenticated();
  if (!authenticated) {
    redirect('/admin/login');
  }
}
