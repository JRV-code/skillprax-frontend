'use client';

import { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const TOKEN_KEY = 'skillprax_auth_token';
const PROFILE_ID_KEY = 'skillprax_active_profile_id';
const USER_CACHE_KEY = 'skillprax_user_profile';

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
 * Hydrates user state from backend GET /api/user/me using saved Bearer token
 */
export async function hydrateUser(): Promise<UserProfile | null> {
  if (typeof window === 'undefined') return null;

  const token = localStorage.getItem(TOKEN_KEY);
  const cachedUserStr = localStorage.getItem(USER_CACHE_KEY);

  if (!token) {
    if (cachedUserStr) {
      try {
        const cached = JSON.parse(cachedUserStr);
        setGlobalState({ user: cached, isAuthenticated: true, isLoading: false });
        return cached;
      } catch (_) {}
    }
    setGlobalState({ isLoading: false });
    return null;
  }

  const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'https://skillprax-backend.onrender.com').replace(/\/+$/, '');

  try {
    const res = await fetch(`${API_BASE}/api/user/me`, {
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
      // If server returned 401, remove token
      if (res.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
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
    localStorage.setItem(TOKEN_KEY, token);
  }
  if (user?.id) {
    localStorage.setItem(PROFILE_ID_KEY, user.id);
  }
  localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));

  setGlobalState({
    user,
    token: token || globalState.token,
    isAuthenticated: true,
    isLoading: false,
  });
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PROFILE_ID_KEY);
  localStorage.removeItem(USER_CACHE_KEY);

  setGlobalState({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
  });
}

export async function updateUser(updated: Partial<UserProfile>): Promise<UserProfile | null> {
  const current = globalState.user;
  const merged = current ? { ...current, ...updated } : (updated as UserProfile);

  localStorage.setItem(USER_CACHE_KEY, JSON.stringify(merged));
  setGlobalState({ user: merged });

  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    try {
      await fetch('/api/user/profile', {
        method: 'PATCH',
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

  return merged;
}

/**
 * useAuthStore hook - Reactive Zustand/Context alternative
 */
export function useAuthStore() {
  const [state, setState] = useState<AuthState>(globalState);

  useEffect(() => {
    listeners.add(setState);

    // Initial hydration if not loaded yet
    if (globalState.isLoading) {
      hydrateUser();
    }

    return () => {
      listeners.delete(setState);
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
