'use client';

import { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const TOKEN_KEYS = ['skillprax_auth_token', 'token', 'skillprax_token', 'authToken'];
const PROFILE_ID_KEY = 'skillprax_active_profile_id';
const USER_CACHE_KEY = 'skillprax_user_profile';

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  for (const key of TOKEN_KEYS) {
    const val = localStorage.getItem(key);
    if (val && val.trim() && val !== 'null' && val !== 'undefined') {
      return val.trim();
    }
  }
  return null;
}

export function saveStoredToken(token: string) {
  if (typeof window === 'undefined') return;
  for (const key of TOKEN_KEYS) {
    localStorage.setItem(key, token);
  }
}

export function clearStoredAuth() {
  if (typeof window === 'undefined') return;
  for (const key of TOKEN_KEYS) {
    localStorage.removeItem(key);
  }
  localStorage.removeItem(PROFILE_ID_KEY);
  localStorage.removeItem(USER_CACHE_KEY);
}

// Global shared state for reactive cross-component synchronization
let globalState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
};

const listeners = new Set<(state: AuthState) => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener({ ...globalState }));
}

function setGlobalState(updates: Partial<AuthState>) {
  globalState = { ...globalState, ...updates };
  notifyListeners();
}

/**
 * Hydrates user state from backend GET /api/auth/me using saved Bearer token
 */
export async function hydrateUser(): Promise<UserProfile | null> {
  if (typeof window === 'undefined') return null;

  const token = getStoredToken();
  const cachedUserStr = localStorage.getItem(USER_CACHE_KEY);

  if (!token) {
    if (cachedUserStr) {
      try {
        const cached = JSON.parse(cachedUserStr);
        setGlobalState({ user: cached, isAuthenticated: true, isLoading: false });
        return cached;
      } catch (_) {}
    }
    setGlobalState({ user: null, token: null, isAuthenticated: false, isLoading: false });
    return null;
  }

  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://skillprax-backend.onrender.com').replace(/\/+$/, '');

  try {
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        throw new Error('Non-JSON response from server during user hydration');
      }
      const data = await res.json();
      const user = data.user || data.profile;
      if (user) {
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
        if (user.id) localStorage.setItem(PROFILE_ID_KEY, user.id);
        setGlobalState({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        return user;
      }
    } else {
      // If server returned 401 or 404, remove stale token
      if (res.status === 401 || res.status === 404) {
        clearStoredAuth();
        setGlobalState({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    }
  } catch (err) {
    console.warn('[useAuthStore] Failed to hydrate user state from server, using local cache:', err);
    if (cachedUserStr) {
      try {
        const cached = JSON.parse(cachedUserStr);
        setGlobalState({ user: cached, token, isAuthenticated: true, isLoading: false });
        return cached;
      } catch (_) {}
    }
  }

  setGlobalState({ isLoading: false });
  return null;
}

export function login(user: UserProfile, token?: string) {
  if (token) {
    saveStoredToken(token);
  }
  if (user?.id) {
    localStorage.setItem(PROFILE_ID_KEY, user.id);
  }
  localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));

  setGlobalState({
    user,
    token: token || getStoredToken() || globalState.token,
    isAuthenticated: true,
    isLoading: false,
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-change'));
    window.dispatchEvent(new Event('storage'));
  }
}

export function logout() {
  clearStoredAuth();

  setGlobalState({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
  });

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-change'));
    window.dispatchEvent(new Event('storage'));
  }
}

export async function updateUser(updated: Partial<UserProfile>): Promise<UserProfile | null> {
  const current = globalState.user;
  const merged = current ? { ...current, ...updated } : (updated as UserProfile);

  localStorage.setItem(USER_CACHE_KEY, JSON.stringify(merged));
  setGlobalState({ user: merged });

  const token = getStoredToken();
  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://skillprax-backend.onrender.com').replace(/\/+$/, '');

  if (token) {
    try {
      await fetch(`${API_BASE}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.warn('[useAuthStore] Background sync of updated profile failed:', err);
    }
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-change'));
  }

  return merged;
}

/**
 * useAuthStore hook - Reactive Zustand/Context alternative
 */
export function useAuthStore() {
  const [state, setState] = useState<AuthState>(globalState);

  useEffect(() => {
    listeners.add(setState);

    const handleAuthEvent = () => {
      hydrateUser();
    };

    window.addEventListener('auth-change', handleAuthEvent);
    window.addEventListener('storage', handleAuthEvent);

    // Initial hydration if not loaded yet
    if (globalState.isLoading) {
      hydrateUser();
    }

    return () => {
      listeners.delete(setState);
      window.removeEventListener('auth-change', handleAuthEvent);
      window.removeEventListener('storage', handleAuthEvent);
    };
  }, []);

  return {
    ...state,
    login,
    logout,
    updateUser,
    hydrateUser,
  };
}
