import { useEffect } from "react";
import { useSyncStore } from "../store/syncStore";
import { syncService } from "../services/sync";
import { syncQueueService } from "../services/syncQueue";
import { authService } from "../services/auth";
import { showToast } from "../utils/toast";

/**
 * Hook to monitor network status and update sync store
 */
const useNetworkStatus = () => {
  useEffect(() => {
    let syncTimeout: NodeJS.Timeout | null = null;

    // Check the initial network status
    const checkInitialStatus = async () => {
      const isOnline = await window.network.isOnline();
      useSyncStore.getState().setOnline(isOnline);

      // Update pending count on app startup
      const pendingCount = await syncQueueService.getPendingCount();
      useSyncStore.getState().setPendingCount(pendingCount);

      // If online and has pending items, start syncing
      if (isOnline && pendingCount > 0) {
        setTimeout(() => void syncService.syncAll(), 2000);
      }
    };

    void checkInitialStatus();

    // Listen for online event
    const handleOnline = () => {
      const currentStatus = useSyncStore.getState().isOnline;

      if (!currentStatus) {
        useSyncStore.getState().setOnline(true);
        useSyncStore.getState().setSyncError(null);

        showToast.success("Back online. Syncing data...");

        void authService.initializeSession();

        if (syncTimeout) clearTimeout(syncTimeout);
        syncTimeout = setTimeout(() => {
          void syncService.syncOnOnline();
        }, 1500);
      }
    };

    // Listen for offline event
    const handleOffline = () => {
      useSyncStore.getState().setOnline(false);
      useSyncStore.getState().setSyncStatus("offline");

      showToast.warning("You are offline. Changes will be synced when reconnected.");

      if (syncTimeout) {
        clearTimeout(syncTimeout);
        syncTimeout = null;
      }
    };

    // Register the event listeners
    const unsubscribeOnline = window.network.onOnline(handleOnline);
    const unsubscribeOffline = window.network.onOffline(handleOffline);

    const checkAppConnectivity = async () => {
      const isConnected = await window.network.checkConnectivity();
      const currentStatus = useSyncStore.getState().isOnline;

      // Update network status if changed
      if (isConnected !== currentStatus) {
        useSyncStore.getState().setOnline(isConnected);

        // Trigger sync if coming back online
        if (isConnected) {
          handleOnline();
        } else {
          handleOffline();
        }
      }
    };

    // Periodic checks for network (every 30 seconds)
    const intervalId = setInterval(() => {
      void checkAppConnectivity();
    }, 30000);

    return () => {
      unsubscribeOnline();
      unsubscribeOffline();
      clearInterval(intervalId);
    };
  }, []);
};

export default useNetworkStatus;
