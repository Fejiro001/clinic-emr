import { ipcMain, net } from "electron";
/**
 * Setup Network related IPC handlers
 *
 * @export
 */
export function setupNetworkIPC(): void {
  // Check if device is online
  ipcMain.handle("network:is-online", () => {
    return net.isOnline();
  });

  ipcMain.handle("network:check-connectivity", async () => {
    try {
      const response = await net.fetch("https://google.com", {
        method: "HEAD",
      });

      return response.ok;
    } catch (error) {
      console.error("Network check failed", error);
      return false;
    }
  });
}
