import { useAuthStore } from "../store/authStore.js";
import type { UserProfile, UserRole } from "../types/index.js";
import { supabase } from "./supabase.js";

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData extends LoginCredentials {
  full_name: string;
  role: UserRole;
  staff_id?: string;
}

export class AuthService {
  private inactivityTimer: NodeJS.Timeout | null = null;

  /**
   * Logs in a user with email and password
   * @param credentials Login credentials
   * @returns User session and profile information
   */
  async login(credentials: LoginCredentials) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        console.error("Supabase auth error:", {
          message: error.message,
          status: error.status,
          name: error.name,
        });
        throw error;
      }

      console.log("Auth successful, user ID:", data.user.id);

      // Save encrypted token via IPC
      await window.auth.saveToken(data.session.access_token);

      console.log("Fetching profile for user:", data.user.id);
      const profile = await this.getUserProfile(data.user.id);

      console.log("Profile result:", profile);

      if (!profile) {
        throw new Error("User profile not found");
      }
      // Update auth store
      useAuthStore.getState().setSession(data.session);
      useAuthStore.getState().setUser(profile);

      // Start inactivity timer
      this.startInactivityTimer();

      return { success: true, session: data.session, user: data.user, profile };
    } catch (error) {
      console.error("Login error details:", error);
      throw error;
    }
  }

  /**
   * Gets user profile from 'users' table
   * @param userId User ID
   * @returns User profile data or null if not found
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    console.log("Querying users table for ID:", userId);

    const { data, error } = await supabase
      .from("users")
      .select("id, email, full_name, role")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user profile:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return null;
    }

    console.log("Profile found:", data);

    return data as UserProfile;
  }

  /**
   * Logout current user
   */
  async logout() {
    try {
      this.stopInactivityTimer();

      await window.auth.clearToken();

      await supabase.auth.signOut();

      useAuthStore.getState().logout();

      return { success: true };
    } catch (error) {
      console.error("Error logging out:", error);
      return { success: false, error: "Logout failed" };
    }
  }

  /**
   * Get current user session
   * @returns User session or null if not found
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error("Error fetching session:", error);
      return null;
    }
  }

  /**
   * Refreshes current user session
   * @returns User session or null if not found
   */
  async refreshSession() {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      return data.session;
    } catch (error) {
      console.error("Error refreshing session:", error);
      return null;
    }
  }

  /**
   * Check session and refresh if needed
   */
  async checkSession() {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;

      if (session) {
        // Check if token is expired
        const expiresAt = session.expires_at ?? 0;
        const isExpired = expiresAt < Date.now() / 1000;

        if (isExpired) {
          // Refresh session
          const refreshedSession = await this.refreshSession();
          return refreshedSession;
        } else {
          useAuthStore.getState().setSession(session);
          return session;
        }
      }

      return null;
    } catch (error) {
      console.error("Session check error:", error);
      return null;
    }
  }

  /**
   * Initialize session on app startup
   */
  async initializeSession() {
    try {
      useAuthStore.getState().setLoading(true);

      // Try to get saved token
      const savedToken = await window.auth.getToken();

      if (savedToken) {
        // Set session with saved token
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (!error && session) {
          const profile = await this.getUserProfile(session.user.id);

          if (profile) {
            useAuthStore.getState().setSession(session);
            useAuthStore.getState().setUser(profile);

            this.startInactivityTimer();

            return { success: true, user: profile };
          }
        }
      }

      return { success: false };
    } catch (error) {
      console.error("Session initialization error:", error);
      return { success: false };
    } finally {
      useAuthStore.getState().setLoading(false);
    }
  }

  /**
   * Create a new user (Admin only)
   * Used in the admin panel to create users
   * @param userData Signup data
   * @returns Auth data of the created user
   */
  async createUser(userData: SignupData) {
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError) throw authError;

    if (authData.user) {
      const { error: profileError } = await supabase.from("users").insert([
        {
          id: authData.user.id,
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role,
        },
      ]);

      if (profileError) throw profileError;
    }
    return authData;
  }

  private startInactivityTimer() {
    this.stopInactivityTimer();

    const checkInactivity = () => {
      const lastActivity = useAuthStore.getState().lastActivity;
      const today = Date.now();
      const timeSinceInactivity = today - lastActivity;

      if (timeSinceInactivity >= INACTIVITY_TIMEOUT) {
        void this.logout();
        window.location.href = "/login?timeout=true";
      } else {
        this.inactivityTimer = setTimeout(checkInactivity, 60000); // Check every minute
      }
    };

    this.inactivityTimer = setTimeout(checkInactivity, 60000); // Check every minute
  }

  private stopInactivityTimer() {
    if (this.inactivityTimer) {
      clearTimeout(this.inactivityTimer);
      this.inactivityTimer = null;
    }
  }

  updateActivity() {
    useAuthStore.getState().updateLastActivity();
  }
}
export const authService = new AuthService();
