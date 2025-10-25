import { create } from "zustand";
import type { UserProfile, UserRole } from "../types";
import type { Session } from "@supabase/supabase-js";

interface AuthState {
  user: UserProfile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  lastActivity: number;
  setUser: (user: UserProfile | null) => void;
  setSession: (session: Session | null) => void;
  setLoading: (loading: boolean) => void;
  updateLastActivity: () => void;
  logout: () => void;
  hasRole: (roles: UserRole | UserRole[]) => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  lastActivity: Date.now(),

  setUser: (user) => {
    set({
      user,
      isAuthenticated: !!user,
      lastActivity: Date.now(),
    });
  },

  setSession: (session) => {
    set({ session });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  updateLastActivity: () => {
    set({ lastActivity: Date.now() });
  },

  logout: () => {
    set({
      user: null,
      session: null,
      isAuthenticated: false,
    });
  },

  hasRole: (roles) => {
    const { user } = get();
    if (!user) return false;

    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    return allowedRoles.includes(user.role);
  },
}));
