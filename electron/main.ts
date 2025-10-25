import { app, BrowserWindow } from "electron";
import path from "path";
import { setupDatabaseIPC } from "./ipc/database.js";
import { initDatabase } from "../src/db/database.js";
import { runMigrations } from "../src/db/migrations.js";
import { setupAuthIPC } from "./ipc/auth.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: VITE_DEV_SERVER_URL
        ? path.join(__dirname, "preload.js")
        : path.join(DIST_PATH, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    await mainWindow.loadFile(path.join(DIST_PATH, "index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};

// Initialize database
function initializeDatabase() {
  try {
    const userDataPath = app.getPath("userData");
    const dbPath = path.join(userDataPath, "clinic-emr.db");

    console.log("Database path:", dbPath);

    // Initialize SQLite
    const db = initDatabase(dbPath);

    // Run migrations
    runMigrations(db);

    console.log("Database ready");
  } catch (error) {
    console.error("Database initialization failed", error);
    throw error;
  }
}
// Setup IPC handlers
setupDatabaseIPC();
setupAuthIPC();

app
  .whenReady()
  .then(() => {
    // First initialize the database
    initializeDatabase();

    // Create window
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

// Quit when all windows are closed, except on macOS. There, it's common for applications and their menu bar to stay active until the user quits explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
