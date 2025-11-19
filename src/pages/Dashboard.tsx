import { useSyncStore } from "../store/syncStore";
import { batchOperationsService } from "../services/batchOperations";
import { useState } from "react";
import { syncQueueService } from "../services/syncQueue";
import { Breadcrumbs } from "../components/Common";

const Dashboard = () => {
  const [testResult, setTestResult] = useState<string>("");

  async function testSync() {
    try {
      const patientId = crypto.randomUUID();
      const randomPhone = `080${String(Math.floor(Math.random() * 100000000))}`;

      await batchOperationsService.executeWrite({
        table: "patients",
        operation: "insert",
        recordId: patientId,
        data: {
          id: patientId,
          surname: "slmls",
          other_names: "djkd",
          date_of_birth: "1999-10-10",
          gender: "female",
          phone: randomPhone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          version: 1,
        },
      });

      setTestResult(`✅ Patient created: ${patientId} (${randomPhone})`);
    } catch (error) {
      setTestResult(
        `❌ Error: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }

  async function clearFailedItems() {
    try {
      await window.db.execute(
        `DELETE FROM sync_queue WHERE status = 'failed' AND retry_count >= 5`
      );

      // Update pending count
      await syncQueueService.updatePendingCount();

      setTestResult("✅ Cleared failed items from queue");
    } catch {
      setTestResult("❌ Failed to clear items");
    }
  }

  const syncState = useSyncStore();

  return (
    <div className="space-y-4">
      <Breadcrumbs>Dashboard</Breadcrumbs>

      {/* Test Button - Only runs when clicked */}
      <div className="bg-white p-4 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-2">Sync Queue Test</h2>
        <button
          onClick={() => void testSync()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Create Test Patient (Queue)
        </button>
        {testResult && <p className="mt-2 text-sm">{testResult}</p>}
      </div>

      <button
        onClick={() => void clearFailedItems()}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Clear Failed Items
      </button>

      {/* Sync State Debug Panel */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Sync Status</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Online:</span>
            <span
              className={syncState.isOnline ? "text-green-600" : "text-red-600"}
            >
              {syncState.isOnline ? " ✅ Yes" : " ❌ No"}
            </span>
          </div>
          <div>
            <span className="font-medium">Status:</span>
            <span className="ml-2 capitalize">{syncState.syncStatus}</span>
          </div>
          <div>
            <span className="font-medium">Pending:</span>
            <span className="ml-2">{syncState.pendingCount} items</span>
          </div>
          <div>
            <span className="font-medium">Conflicts:</span>
            <span className="ml-2">{syncState.conflictsCount}</span>
          </div>
          <div className="col-span-2">
            <span className="font-medium">Last Sync:</span>
            <span className="ml-2">
              {syncState.lastSyncTime
                ? new Date(syncState.lastSyncTime).toLocaleString()
                : "Never"}
            </span>
          </div>
        </div>

        {syncState.syncError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-800">
            <strong>Error:</strong> {syncState.syncError}
          </div>
        )}
      </div>

      {/* Raw State (for debugging) */}
      <details className="bg-gray-100 p-4 rounded-lg">
        <summary className="cursor-pointer font-semibold">
          Raw Sync State (Debug)
        </summary>
        <pre className="mt-2 text-xs overflow-auto">
          {JSON.stringify(syncState, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default Dashboard;
