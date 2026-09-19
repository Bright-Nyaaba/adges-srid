// Auth + "is this person allowed to edit the site" helpers.
// Supports both designated credential login (Username: ADGES-SRID / Password: adges@admin123)
// and Google Account Sign-In with admin allowlist.
import { useEffect, useState, useCallback } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, googleProvider, db, cloudInfo } from '../firebase.js';

export { cloudInfo };

export const ADMIN_USERNAME = 'ADGES-SRID';
const ADMIN_PASSWORD = 'adges@admin123';
const SESSION_KEY = 'adges_admin_session';

function getStoredAdminSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session && session.username && session.username.toUpperCase() === ADMIN_USERNAME.toUpperCase()) {
      return session;
    }
  } catch (err) {
    console.warn('[auth] Could not read stored admin session', err);
  }
  return null;
}

export function loginWithAdminCredentials(username = '', password = '') {
  const cleanUsername = String(username).trim();
  const cleanPassword = String(password);

  if (!cleanUsername) {
    return { success: false, error: 'Please enter your admin username.' };
  }
  if (!cleanPassword) {
    return { success: false, error: 'Please enter your admin password.' };
  }

  const isUsernameMatch = cleanUsername.toUpperCase() === ADMIN_USERNAME.toUpperCase() ||
    cleanUsername.toLowerCase() === 'adges-srid@umat.edu.gh';

  if (!isUsernameMatch) {
    return { success: false, error: 'Invalid username. Authorized admin username is ADGES-SRID.' };
  }

  if (cleanPassword !== ADMIN_PASSWORD) {
    return { success: false, error: 'Invalid password. Please check your credentials and try again.' };
  }

  const session = {
    username: ADMIN_USERNAME,
    displayName: 'ADGES-SRID (Admin)',
    email: 'adges-srid@umat.edu.gh',
    role: 'admin',
    isAdmin: true,
    isLocalAdmin: true,
    loggedInAt: new Date().toISOString()
  };

  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    window.dispatchEvent(new CustomEvent('adges-auth-change', { detail: session }));
  } catch (err) {
    console.error('[auth] localStorage write failed', err);
  }

  return { success: true, user: session };
}

export function signInWithGoogle() {
  return signInWithPopup(auth, googleProvider);
}

export async function signOut() {
  try {
    localStorage.removeItem(SESSION_KEY);
    window.dispatchEvent(new CustomEvent('adges-auth-change', { detail: null }));
  } catch (err) {
    console.warn('[auth] Failed removing session', err);
  }
  try {
    await firebaseSignOut(auth);
  } catch (err) {
    console.warn('[auth] Firebase signOut non-fatal', err);
  }
}

/**
 * React hook: { user, isEditor, loading, loginWithAdminCredentials, signOut, signInWithGoogle }
 */
export function useAuth() {
  const [user, setUser] = useState(() => getStoredAdminSession());
  const [isEditor, setIsEditor] = useState(() => Boolean(getStoredAdminSession()));
  const [loading, setLoading] = useState(true);

  // Sync stored admin session or custom events
  const syncLocalSession = useCallback(() => {
    const session = getStoredAdminSession();
    if (session) {
      setUser(session);
      setIsEditor(true);
    }
  }, []);

  useEffect(() => {
    // Initial check
    syncLocalSession();

    const handleCustomChange = (e) => {
      const session = e.detail;
      if (session) {
        setUser(session);
        setIsEditor(true);
      } else {
        // If not logged in via Google either
        if (!auth.currentUser) {
          setUser(null);
          setIsEditor(false);
        }
      }
    };

    window.addEventListener('adges-auth-change', handleCustomChange);
    window.addEventListener('storage', syncLocalSession);

    // Firebase Auth listener for Google OAuth accounts
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      const localAdmin = getStoredAdminSession();
      if (localAdmin) {
        setUser(localAdmin);
        setIsEditor(true);
      } else if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
        setIsEditor(false);
      }
      setLoading(false);
    });

    return () => {
      window.removeEventListener('adges-auth-change', handleCustomChange);
      window.removeEventListener('storage', syncLocalSession);
      unsubAuth();
    };
  }, [syncLocalSession]);

  // If user is a Firebase Auth user (Google login), check owner / allowlist
  useEffect(() => {
    if (!user) {
      setIsEditor(false);
      return;
    }
    if (user.isAdmin || user.isLocalAdmin) {
      setIsEditor(true);
      return;
    }

    const ownerEmail = 'nyaababright93@gmail.com';
    const isOwner = Boolean(user.email && user.email.toLowerCase() === ownerEmail.toLowerCase());
    if (isOwner) setIsEditor(true);

    try {
      const unsub = onSnapshot(
        doc(db, 'meta', 'admins'),
        (snap) => {
          const emails = snap.exists() ? (snap.data().emails || []) : [];
          if (isOwner) {
            setIsEditor(true);
          } else {
            setIsEditor(emails.map((e) => e.toLowerCase()).includes((user.email || '').toLowerCase()));
          }
        },
        () => setIsEditor(isOwner)
      );
      return () => unsub && unsub();
    } catch {
      setIsEditor(isOwner);
    }
  }, [user]);

  return {
    user,
    isEditor,
    loading,
    loginWithAdminCredentials,
    signOut,
    signInWithGoogle
  };
}
