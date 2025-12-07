import { pushSyncService } from "./pushSync";
import { pullSyncService } from "./pullSync";
import { useSyncStore } from "../store/syncStore";

const PERIODIC_SYNC_INTERVAL = 30 * 60 * 1000; // 30 minutes

/**
 * Sync Coordinator - Orchestrates bidirectional sync
 * Coordinates push (local → Supabase) and pull (Supabase → local) operations
 * Integrates with existing useNetworkStatus hook
 */
export class SyncCoordinator {
  private periodicSyncTimer: NodeJS.Timeout | null = null;
  private isInitialized = false;

  /**
   * Initialize sync system on app startup
   * Called from useNetworkStatus after initial network check
   */
  async initializeOnStartup(): Promise<void> {
    if (this.isInitialized) return;

    console.log("Initializing sync coordinator on startup...");
    this.isInitialized = true;

    const { isOnline } = useSyncStore.getState();

    if (isOnline) {
      // Run initial pull sync on startup
      console.log("Running initial pull sync...");
      await pullSyncService.syncOnStartup();

      // Start periodic sync
      this.startPeriodicSync();
    }
  }

  /**
   * Handle coming online (called from useNetworkStatus)
   * This is triggered when network status changes from offline to online
   */
  async handleOnline(): Promise<void> {
    console.log("Sync coordinator: Handling online event");

    // Small delay to let connection stabilize
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Run full bidirectional sync
    await this.runFullSync();

    // Start periodic sync if not already running
    this.startPeriodicSync();
  }

  /**
   * Handle going offline (called from useNetworkStatus)
   */
  handleOffline(): void {
    console.log("Sync coordinator: Handling offline event");
    
    // Stop periodic sync
    this.stopPeriodicSync();
  }

  /**
   * Run a full bidirectional sync
   * Order: Pull first (get latest data), then Push (send local changes)
   */
  async runFullSync(): Promise<void> {
    const { isOnline } = useSyncStore.getState();

    if (!isOnline) {
      console.log("Cannot sync: offline");
      return;
    }

    try {
      console.log("Starting full bidirectional sync...");
      
      // Don't set syncing status here - let pull/push services handle it
      // This prevents status flickering

      // Step 1: Pull from Supabase (get latest data)
      console.log("Step 1: Pulling from Supabase...");
      await pullSyncService.pullAll();

      // Step 2: Push to Supabase (send local changes)
      // Note: pushSyncService.syncAll() is already called by useNetworkStatus
      // So we only call it here if there are still pending items after pull
      const { pendingCount } = useSyncStore.getState();
      if (pendingCount > 0) {
        console.log("Step 2: Pushing to Supabase...");
        await pushSyncService.syncAll();
      }

      console.log("Full sync completed successfully");
    } catch (error) {
      console.error("Full sync failed:", error);
      useSyncStore.getState().setSyncStatus("error");
    }
  }

  /**
   * Start periodic sync (every 30 minutes)
   */
  private startPeriodicSync(): void {
    // Clear existing timer if any
    if (this.periodicSyncTimer) {
      clearInterval(this.periodicSyncTimer);
    }

    this.periodicSyncTimer = setInterval(() => {
      void this.runPeriodicSync();
    }, PERIODIC_SYNC_INTERVAL);

    console.log("Periodic sync started (every 30 minutes)");
  }

  /**
   * Stop periodic sync
   */
  private stopPeriodicSync(): void {
    if (this.periodicSyncTimer) {
      clearInterval(this.periodicSyncTimer);
      this.periodicSyncTimer = null;
      console.log("Periodic sync stopped");
    }
  }

  /**
   * Run periodic sync (pull then push)
   */
  private async runPeriodicSync(): Promise<void> {
    const { isOnline, syncStatus } = useSyncStore.getState();

    // Don't run periodic sync if offline or already syncing
    if (!isOnline || syncStatus === "syncing") {
      return;
    }

    console.log("Running periodic sync...");
    await this.runFullSync();
  }

  /**
   * Manual sync trigger (called by user clicking sync button)
   * Runs full bidirectional sync
   */
  async syncNow(): Promise<void> {
    const { syncStatus } = useSyncStore.getState();
    
    if (syncStatus === "syncing") {
      console.log("Sync already in progress");
      return;
    }

    await this.runFullSync();
  }

  /**
   * Push only (for immediate local changes)
   * This is called by batchOperationsService when user makes changes
   */
  async pushNow(): Promise<void> {
    await pushSyncService.syncNow();
  }

  /**
   * Pull only (to refresh from server)
   */
  async pullNow(): Promise<void> {
    await pullSyncService.syncNow();
  }

  /**
   * Retry failed syncs
   * Delegates to pushSyncService
   */
  async retryFailed(): Promise<void> {
    await pushSyncService.retryFailed();
  }

  /**
   * Cleanup on app shutdown
   */
  cleanup(): void {
    this.stopPeriodicSync();
    pushSyncService.clearRetrySchedules();
    this.isInitialized = false;
    console.log("Sync coordinator cleaned up");
  }
}

export const syncCoordinator = new SyncCoordinator();