import { supabase } from "./supabase.js";
import { useAuthStore } from "../store/authStore.js";
import { useSyncStore } from "../store/syncStore.js";
import type { UserProfile, UserRole } from "../types/index.js";
import { showToast } from "../utils/toast.js";

const INACTIVITY_TIMEOUT = 60 * 60 * 1000; // 1 hour

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
        showToast.error(
          error.message.includes("fetch")
            ? "Unable to login"
            : "Invalid email or password"
        );
        return {
          success: false,
          error: error.message.includes("fetch")
            ? "Unable to login"
            : "Invalid email or password",
        };
      }

      // Save encrypted token via IPC
      await window.auth.saveToken(
        data.session.access_token,
        data.session.refresh_token
      );

      const profile = await this.getUserProfile(data.user.id);

      if (!profile) {
        throw new Error("User profile not found");
      }

      // Save encrypted user profile for offline access
      await window.auth.saveUserProfile(JSON.stringify(profile));

      // Update auth store
      useAuthStore.getState().setSession(data.session);
      useAuthStore.getState().setUser(profile);

      // Start inactivity timer
      this.startInactivityTimer();

      showToast.success(`Welcome back, ${profile.full_name}!`);
      return { success: true, session: data.session, user: data.user, profile };
    } catch (error) {
      showToast.error("Login failed. Please try again.");
      throw error;
    }
  }

  /**
   * Gets user profile from 'users' table
   * @param userId User ID
   * @returns User profile data or null if not found
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from("users")
      .select("id, email, full_name, role")
      .eq("id", userId)
      .single();

    if (error) {
      return null;
    }

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

      showToast.info("Logged out successfully.");
      return { success: true };
    } catch {
      showToast.error("Logout failed");
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
    } catch {
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
    } catch {
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
    } catch {
      return null;
    }
  }

  /**
   * Initialize session on app startup
   * Also works offline by using cached user profile
   */
  async initializeSession() {
    try {
      useAuthStore.getState().setLoading(true);

      // Check if we have a saved token
      const hasToken = await window.auth.hasToken();

      if (!hasToken) {
        return { success: false, reason: "no_token" };
      }

      // Try to get saved tokens
      const { access_token, refresh_token } = await window.auth.getToken();

      if (!access_token || !refresh_token) {
        return { success: false, reason: "invalid_token" };
      }

      const { isOnline } = useSyncStore.getState();

      if (isOnline) {
        // Try online validation first
        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: access_token,
            refresh_token: refresh_token,
          });

          if (!error && data.session) {
            const profile = await this.getUserProfile(data.session.user.id);

            if (profile) {
              // Update cached profile
              await window.auth.saveUserProfile(JSON.stringify(profile));

              useAuthStore.getState().setSession(data.session);
              useAuthStore.getState().setUser(profile);
              this.startInactivityTimer();

              return { success: true, user: profile, source: "online" };
            }
          } else {
            console.error("Online session validation error:", error);
          }
        } catch (onlineError) {
          console.error(
            "Online validation failed, trying offline cache:",
            onlineError
          );
        }
      }

      // Offline or online validation failed: use cached profile
      const cachedProfileStr = await window.auth.getUserProfile();

      if (cachedProfileStr) {
        try {
          const cachedProfile = JSON.parse(cachedProfileStr) as UserProfile;

          useAuthStore.getState().setUser(cachedProfile);
          this.startInactivityTimer();

          return {
            success: true,
            user: cachedProfile,
            source: "offline_cache",
          };
        } catch (parseError) {
          console.error("Error parsing cached profile:", parseError);
        }
      }

      return { success: false, reason: "no_cached_profile" };
    } catch (error) {
      return { success: false, error };
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
