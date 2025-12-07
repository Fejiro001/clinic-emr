import { useState } from "react";
import { Clock10, TriangleAlert, X } from "lucide-react";
import type { FailedItem } from "../../types";
import { syncCoordinator } from "../../services/syncCoordinator";
import SyncActionButtons from "./SyncActionButtons";

interface SyncDetailsProps {
  setShowDetails: (show: boolean) => void;
  isOnline: boolean;
  isRetrying: boolean;
  pendingCount: number;
  failedItems: FailedItem[];
  retryTimes: Map<number, number>;
  formatLastSync: () => string;
  handleRetryFailed: (e: React.MouseEvent) => void;
  handleSyncNow: (e: React.MouseEvent) => void;
}

const SyncDetails = ({
  setShowDetails,
  isOnline,
  isRetrying,
  pendingCount,
  failedItems,
  retryTimes,
  formatLastSync,
  handleRetryFailed,
  handleSyncNow,
}: SyncDetailsProps) => {
  const [isPulling, setIsPulling] = useState(false);
  const [isPushing, setIsPushing] = useState(false);

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${String(seconds)}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(minutes)}m ${String(secs)}s`;
  };

  const handlePullOnly = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOnline || isPulling || isRetrying) return;

    setIsPulling(true);
    try {
      await syncCoordinator.pullNow();
    } finally {
      setIsPulling(false);
    }
  };

  const handlePushOnly = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOnline || isPushing || isRetrying || pendingCount === 0) return;

    setIsPushing(true);
    try {
      await syncCoordinator.pushNow();
    } finally {
      setIsPushing(false);
    }
  };

  return (
    <div className="mt-2 border-t border-gray-300 bg-white shadow-lg z-50">
      <div className="p-4 space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-2">
          <h3 className="font-semibold text-gray-900 text-sm">Sync Details</h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(false);
            }}
            className="bg-gray-500 rounded hover:bg-gray-600 p-0.5 text-white"
            title="Close Sync Details"
          >
            <X size={16} strokeWidth={3} />
          </button>
        </div>

        {/* Status Info */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Network Status:</span>
            <span
              className={`font-medium ${isOnline ? "text-green-600" : "text-red-600"}`}
            >
              {isOnline ? "Online" : "Offline"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Pending Items:</span>
            <span className="font-medium text-gray-900">{pendingCount}</span>
          </div>
          {failedItems.length > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Failed Items:</span>
              <span className="font-medium text-red-600">
                {failedItems.length}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Last Sync:</span>
            <span className="font-medium text-gray-900">
              {formatLastSync()}
            </span>
          </div>
        </div>

        {/* Failed Items List */}
        {failedItems.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <TriangleAlert size={16} className="text-red-500" />
              Failed Items ({failedItems.length})
            </h4>
            <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border border-gray-200 p-2">
              {failedItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-md bg-red-50 border border-red-200 p-3 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-900">
                      Table: {item.table_name}
                    </span>
                    <span className="text-gray-600 text-xs">
                      Retry {item.retry_count}/5
                    </span>
                  </div>
                  {item.error_message && (
                    <p className="text-red-700 break-words">
                      Error: {item.error_message}
                    </p>
                  )}
                  {retryTimes.has(item.id) &&
                    (retryTimes.get(item.id) ?? -1) > 0 && (
                      <div className="flex items-center gap-1 text-gray-600 mt-1">
                        <Clock10 size={12} />
                        <span>
                          Next retry in{" "}
                          {formatTime(retryTimes.get(item.id) ?? 0)}
                        </span>
                      </div>
                    )}
                  {retryTimes.has(item.id) && retryTimes.get(item.id) === 0 && (
                    <div className="text-green-700 font-medium">
                      Ready to retry now
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons Section */}
        {isOnline && (
          <SyncActionButtons
            pendingCount={pendingCount}
            handleSyncNow={handleSyncNow}
            isRetrying={isRetrying}
            isPulling={isPulling}
            isPushing={isPushing}
            failedItems={failedItems}
            handlePullOnly={handlePullOnly}
            handlePushOnly={handlePushOnly}
            handleRetryFailed={handleRetryFailed}
          />
        )}

        {!isOnline && (
          <div className="text-center text-sm text-gray-500 py-2">
            Connect to the internet to sync
          </div>
        )}
      </div>
    </div>
  );
};

export default SyncDetails;
