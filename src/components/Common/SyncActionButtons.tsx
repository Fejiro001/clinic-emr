import { Loader2, RefreshCcw, Download, Upload } from "lucide-react";
import type { FailedItem } from "../../types";

interface SyncActionButtonsProps {
  pendingCount: number;
  isRetrying: boolean;
  isPulling: boolean;
  isPushing: boolean;
  failedItems: FailedItem[];
  handleSyncNow: (e: React.MouseEvent) => void;
  handlePullOnly: (e: React.MouseEvent) => Promise<void>;
  handlePushOnly: (e: React.MouseEvent) => Promise<void>;
  handleRetryFailed: (e: React.MouseEvent) => void;
}

const SyncActionButtons = ({
  pendingCount,
  isRetrying,
  isPulling,
  isPushing,
  failedItems,
  handleSyncNow,
  handlePullOnly,
  handlePushOnly,
  handleRetryFailed,
}: SyncActionButtonsProps) => {
  return (
    <div className="space-y-2 pt-2 border-t">
      {/* Full Sync (existing behavior) */}
      <button
        onClick={handleSyncNow}
        disabled={isRetrying || isPulling || isPushing}
        className="w-full flex items-center justify-center gap-2 rounded-md border border-blue-600 bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        title="Pull latest data and push local changes"
      >
        {isRetrying ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
        Full Sync (Pull + Push)
      </button>

      {/* Pull and Push buttons side by side */}
      <div className="flex gap-2">
        {/* Pull from Server */}
        <button
          onClick={void handlePullOnly}
          disabled={isRetrying || isPulling || isPushing}
          className="flex-1 flex items-center justify-center gap-2 rounded-md border border-indigo-600 bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700 hover:bg-indigo-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed transition-colors"
          title="Pull latest data from server"
        >
          {isPulling ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Download className="h-4 w-4" />
          )}
          Pull
        </button>

        {/* Push to Server */}
        <button
          onClick={void handlePushOnly}
          disabled={isRetrying || isPulling || isPushing || pendingCount === 0}
          className="flex-1 flex items-center justify-center gap-2 rounded-md border border-green-600 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 hover:bg-green-100 disabled:bg-gray-100 disabled:text-gray-400 disabled:border-gray-300 disabled:cursor-not-allowed transition-colors"
          title={
            pendingCount === 0
              ? "No pending changes"
              : "Push local changes to server"
          }
        >
          {isPushing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          Push {pendingCount > 0 && `(${String(pendingCount)})`}
        </button>
      </div>

      {/* Retry Failed Items - only show if there are failed items */}
      {failedItems.length > 0 && (
        <button
          onClick={handleRetryFailed}
          disabled={isRetrying || isPulling || isPushing}
          className="w-full flex items-center justify-center gap-2 rounded-md bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          title="Retry all failed sync items"
        >
          {isRetrying ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
          Retry Failed Items
        </button>
      )}
    </div>
  );
};

export default SyncActionButtons;
