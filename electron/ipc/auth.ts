import { ipcMain, safeStorage } from "electron";
import Store from "electron-store";

const store = new Store();

const STORAGE_KEY = "auth_token_encrypted";
const USER_PROFILE_KEY = "user_profile_encrypted";
/**
 * Setup IPC handlers for authentication
 *
 * @export
 */
export function setupAuthIPC(): void {
  // Save encrypted auth token to secure storage
  ipcMain.handle("auth:save-token", (_event, token: string) => {
    try {
      if (!safeStorage.isEncryptionAvailable()) {
        console.warn("Encryption not available, storing token as a plain text");
        store.set(STORAGE_KEY, token);
        return { success: true };
      }

      const encryptedToken = safeStorage.encryptString(token);

      store.set(STORAGE_KEY, encryptedToken.toString("base64"));

      return { success: true };
    } catch (error) {
      console.error("Error saving token:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save token",
      };
    }
  });

  // Retrieve and decrypt auth token from secure storage
  ipcMain.handle("auth:get-token", () => {
    try {
      const storedData = store.get(STORAGE_KEY) as string | undefined;
      if (!storedData) {
        return null;
      }

      if (!safeStorage.isEncryptionAvailable()) {
        // plain text fallback
        return storedData;
      }

      const buffer = Buffer.from(storedData, "base64");
      const decryptedToken = safeStorage.decryptString(buffer);

      return decryptedToken;
    } catch (error) {
      console.error("Error retrieving token:", error);
      return null;
    }
  });

  // Clear stored token
  ipcMain.handle("auth:clear-token", () => {
    try {
      store.delete(STORAGE_KEY);
      return { success: true };
    } catch (error) {
      console.error("Error clearing token:", error);
      return { success: false };
    }
  });

  // Check if token exists
  ipcMain.handle("auth:has-token", () => {
    return store.has(STORAGE_KEY);
  });

  // Save encrypted user profile
  ipcMain.handle("auth:save-user-profile", (_event, profile: string) => {
    try {
      if (!safeStorage.isEncryptionAvailable()) {
        store.set(USER_PROFILE_KEY, profile);
        return { success: true };
      }

      const encryptedProfile = safeStorage.encryptString(profile);
      store.set(USER_PROFILE_KEY, encryptedProfile);
      return { success: true };
    } catch (error) {
      console.error("Error saving user profile:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to save user profile",
      };
    }
  });

  // Retrieve and decrypt user profile
  ipcMain.handle("auth:get-user-profile", () => {
    try {
      const storedData = store.get(USER_PROFILE_KEY) as string | undefined;

      if (!storedData) {
        return null;
      }

      if (!safeStorage.isEncryptionAvailable()) {
        return storedData;
      }

      const buffer = Buffer.from(storedData, "base64");
      const decryptedProfile = safeStorage.decryptString(buffer);
      return decryptedProfile;
    } catch (error) {
      console.error("Error retrieving profile:", error);
      return null;
    }
  });
}
