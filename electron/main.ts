import { app, BrowserWindow } from "electron";
import path from "path";
import { setupDatabaseIPC } from "./ipc/database";
const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;

const DIST_PATH = path.join(__dirname, "../../dist");

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(DIST_PATH, "../public")
  : process.env.DIST;

let mainWindow: BrowserWindow | null = null;

const createWindow = async () => {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 765,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  console.log("Preload path:", path.join(__dirname, "preload.js"));
  console.log("DIST_PATH:", DIST_PATH);
  console.log("🚀 VITE_DEV_SERVER_URL =", VITE_DEV_SERVER_URL);

  if (VITE_DEV_SERVER_URL) {
    // In development, load the Vite dev server URL.
    await mainWindow.loadURL(VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    // In production, load the built index.html file.
    await mainWindow.loadFile(path.join(DIST_PATH, "index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

app
  .whenReady()
  .then(() => {
    setupDatabaseIPC();

    void createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        void createWindow();
      }
    });
  })
  .catch((error: unknown) => {
    console.error("Failed to initialize app:", error);
  });

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
