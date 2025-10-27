import {
  Clock10,
  CloudCheck,
  RefreshCcw,
  SatelliteDish,
  TriangleAlert,
} from "lucide-react";
import { useSyncStore } from "../../store/syncStore";

const SyncStatusIndicator = () => {
  const { isOnline, syncStatus, pendingCount, conflictsCount, lastSyncTime } =
    useSyncStore();

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
        icon: <SatelliteDish size={15} />,
        text: "Offline",
        detail: "Working offline",
      };
    }

    switch (syncStatus) {
      case "syncing":
        return {
          color: "bg-blue-500",
          bgColor: "bg-blue-100",
          icon: <RefreshCcw size={15} />,
          text: "Syncing",
          detail: `${String(pendingCount)} items`,
        };
      case "synced":
        return {
          color: "bg-green-500",
          bgColor: "bg-green-100",
          icon: <CloudCheck size={15} />,
          text: "Synced",
          detail: formatLastSync(),
        };
      case "error":
        return {
          color: "bg-red-500",
          bgColor: "bg-red-100",
          icon: <TriangleAlert size={15} />,
          text: "Sync Error",
          detail: "Click to retry",
        };
      case "offline":
        return {
          color: "bg-gray-500",
          bgColor: "bg-gray-200",
          icon: <SatelliteDish size={15} />,
          text: "Offline",
          detail: "Working offline",
        };
      default:
        return {
          color: "bg-gray-600",
          bgColor: "bg-gray-200",
          icon: <Clock10 size={15} />,
          text: "Idle",
          detail: formatLastSync(),
        };
    }
  };

  const status = getStatusDisplay();

  return (
    <div
      className={`${status.bgColor} flex items-center space-x-3 px-4 mx-4 py-2 border border-gray-200 rounded-lg shadow-sm`}
    >
      {/* Status Indicator Dot */}
      <div className="relative">
        <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
        {syncStatus === "syncing" && (
          <div className="absolute inset-0 w-3 h-3 rounded-full bg-blue-400 animate-ping"></div>
        )}
      </div>

      {/* Status Text */}
      <div className="flex flex-col">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-900 flex items-center gap-1">
            <span className={syncStatus === "syncing" ? "animate-spin" : ""}>
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
        <span className="text-xs text-gray-500">{status.detail}</span>
      </div>

      {/* Pending Count Badge */}
      {pendingCount > 0 && (
        <span className="ml-auto px-2 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full">
          {pendingCount} pending
        </span>
      )}
    </div>
  );
};

export default SyncStatusIndicator;
