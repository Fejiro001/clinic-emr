import { useEffect } from "react";
import { useSyncStore } from "../store/syncStore";

/**
 * Hook to monitor network status and update sync store
 */
const useNetworkStatus = () => {
  useEffect(() => {
    // Check the initial network status
    const checkInitialStatus = async () => {
      const isOnline = await window.network.isOnline();
      console.log(
        "📡 Initial network status:",
        isOnline ? "Online" : "Offline"
      );
      useSyncStore.getState().setOnline(isOnline);
    };

    void checkInitialStatus();

    // Listen for online event
    const handleOnline = () => {
      console.log("Network: Online");
      useSyncStore.getState().setOnline(true);
      useSyncStore.getState().setSyncError(null);
    };

    // Listen for offline event
    const handleOffline = () => {
      console.log("Network: Offline");
      useSyncStore.getState().setOnline(false);
      useSyncStore.getState().setSyncStatus("offline");
    };

    // Register the event listeners
    const unsubscribeOnline = window.network.onOnline(handleOnline);
    const unsubscribeOffline = window.network.onOffline(handleOffline);

    const checkAppConnectivity = async () => {
      const isConnected = await window.network.checkConnectivity();
      const currentStatus = useSyncStore.getState().isOnline;

      // Update network status if changed
      if (isConnected !== currentStatus) {
        console.log(
          "🔄 Network status changed:",
          isConnected ? "Online" : "Offline"
        );
        useSyncStore.getState().setOnline(isConnected);
      }
    };

    // Periodic checks for network (every 30 seconds)
    const intervalId = setInterval(() => {
      console.log('30 seconds check');
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
