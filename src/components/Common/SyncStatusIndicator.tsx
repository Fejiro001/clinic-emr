import { useEffect, useState } from "react";
import { useSyncStore } from "../../store/syncStore";
import { pushSyncService } from "../../services/pushSync";
import { syncQueueService } from "../../services/syncQueue";
import type { FailedItem } from "../../types";
import {
  ChevronDown,
  ChevronUp,
  Clock10,
  CloudCheck,
  RefreshCcw,
  SatelliteDish,
  TriangleAlert,
} from "lucide-react";
import { SyncDetails } from ".";

const SyncStatusIndicator = () => {
  const { isOnline, syncStatus, pendingCount, conflictsCount, lastSyncTime } =
    useSyncStore();
  const [showDetails, setShowDetails] = useState(false);
  const [failedItems, setFailedItems] = useState<FailedItem[]>([]);
  const [retryTimes, setRetryTimes] = useState<Map<number, number>>(new Map());
  const [isRetrying, setIsRetrying] = useState(false);

  // Load failed items when details panel is open
  useEffect(() => {
    const loadFailedItems = async () => {
      const items = await syncQueueService.getAllPendingItems(100);
      const failed = items
        .filter((item) => item.status === "failed")
        .map((item) => ({
          id: item.id,
          table_name: item.table_name,
          retry_count: item.retry_count ?? 0,
          error_message: item.error_message,
          nextRetry: pushSyncService.getNextRetryTime(item) ?? 0,
        }));

      setFailedItems(failed);

      // Countdown Timers
      const times = new Map<number, number>();
      failed.forEach((item) => {
        if (item.nextRetry && item.nextRetry > 0) {
          times.set(item.id, item.nextRetry);
        }
      });
      setRetryTimes(times);
    };

    if (showDetails) {
      void loadFailedItems();
    }
  }, [showDetails, syncStatus]);

  useEffect(() => {
    if (retryTimes.size === 0) return;

    const interval = setInterval(() => {
      setRetryTimes((prev) => {
        const next = new Map(prev);
        next.forEach((value, key) => {
          const newValue = Math.max(0, value - 1);
          if (newValue === 0) {
            next.delete(key);
          } else {
            next.set(key, newValue);
          }
        });
        return next;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, [retryTimes.size]);

  // Format last sync time
  const formatLastSync = () => {
    if (!lastSyncTime) return "Never synced";

    const now = Date.now();
    const diff = now - lastSyncTime;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes === 1) return "1 minute ago";
    if (minutes > 1) return `${String(minutes)} minutes ago`;

    const hours = Math.floor(minutes / 60);
    if (hours === 1) return "1 hour ago";
    return `${String(hours)} hours ago`;
  };

  const getStatusDisplay = () => {
    if (!isOnline) {
      return {
        color: "bg-gray-500",
        bgColor: "bg-gray-200",
        icon: <SatelliteDish size={18} />,
        text: "Offline",
        detail: "Working offline",
      };
    }

    switch (syncStatus) {
      case "syncing":
        return {
          color: "bg-blue-500",
          bgColor: "bg-blue-100",
          icon: <RefreshCcw size={18} />,
          text: "Syncing",
          detail: `${String(pendingCount)} items`,
        };
      case "synced":
        return {
          color: "bg-green-500",
          bgColor: "bg-green-100",
          icon: <CloudCheck size={18} />,
          text: "Synced",
          detail: formatLastSync(),
        };
      case "error":
        return {
          color: "bg-red-500",
          bgColor: "bg-red-100",
          icon: <TriangleAlert size={18} />,
          text: "Sync Error",
          detail: "Click to retry",
        };
      case "offline":
        return {
          color: "bg-gray-500",
          bgColor: "bg-gray-200",
          icon: <SatelliteDish size={18} />,
          text: "Offline",
          detail: "Working offline",
        };
      default:
        return {
          color: "bg-gray-600",
          bgColor: "bg-gray-200",
          icon: <Clock10 size={18} />,
          text: "Idle",
          detail: formatLastSync(),
        };
    }
  };

  const status = getStatusDisplay();

  const handleRetryFailed = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRetrying(true);
    try {
      await pushSyncService.retryFailed();
    } finally {
      setIsRetrying(false);
      if (showDetails) {
        setTimeout(() => {
          void syncQueueService.getAllPendingItems(100).then((items) => {
            const failed = items
              .filter((item) => item.status === "failed")
              .map((item) => ({
                id: item.id,
                table_name: item.table_name,
                retry_count: item.retry_count ?? 0,
                error_message: item.error_message,
                nextRetry: pushSyncService.getNextRetryTime(item) ?? 0,
              }));
            setFailedItems(failed);
          });
        }, 1000);
      }
    }
  };

  const handleSyncNow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOnline) return;
    setIsRetrying(true);
    try {
      await pushSyncService.syncNow();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <>
      <div
        className={`${status.bgColor} flex flex-col items-center gap-3 px-4 mx-2 py-2 border border-gray-200 rounded shadow-sm`}
        onClick={() => {
          setShowDetails(!showDetails);
        }}
        title={
          syncStatus === "error"
            ? "Click to retry"
            : isOnline
              ? "Click to sync now"
              : "Offline - working locally"
        }
      >
        <div className="flex gap-4 justify-between items-center">
          {/* Status Indicator Dot */}
          <div className="relative">
            <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
            {syncStatus === "syncing" && (
              <div className="absolute inset-0 w-3 h-3 rounded-full bg-blue-400 animate-ping"></div>
            )}
          </div>

          {/* Status Text */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
                <span
                  className={syncStatus === "syncing" ? "animate-spin" : ""}
                >
                  {status.icon}
                </span>
                {status.text}
              </span>
              {conflictsCount > 0 && (
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                  {conflictsCount} conflicts
                </span>
              )}
            </div>
            <span className="text-xs text-gray-600">{status.detail}</span>
          </div>
          {showDetails ? (
            <ChevronUp size={16} className="text-gray-500" />
          ) : (
            <ChevronDown size={16} className="text-gray-500" />
          )}
        </div>

        {/* Pending Count Badge */}
        {pendingCount > 0 && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
            {pendingCount} pending
          </span>
        )}
      </div>

      {/* Details Dropdown Panel */}
      {showDetails && (
        <SyncDetails
          setShowDetails={setShowDetails}
          isOnline={isOnline}
          isRetrying={isRetrying}
          pendingCount={pendingCount}
          failedItems={failedItems}
          retryTimes={retryTimes}
          formatLastSync={formatLastSync}
          handleRetryFailed={handleRetryFailed}
          handleSyncNow={handleSyncNow}
        />
      )}
    </>
  );
};

export default SyncStatusIndicator;
