import { ipcMain, safeStorage } from "electron";
import Store from "electron-store";

const store = new Store();

const STORAGE_KEY = "auth_token_encrypted";
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
}
