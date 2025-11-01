import { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import { conflictResolutionService } from "../../services/conflictResolution";

interface Conflict {
  id: number;
  table_name: string;
  record_id: string;
  local_version: Record<string, unknown>;
  remote_version: Record<string, unknown>;
  conflict_type: string;
  timestamp: string;
}

interface ConflictResolverProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConflictResolver = ({ isOpen, onClose }: ConflictResolverProps) => {
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(
    null
  );
  const { user } = useAuthStore();

  useEffect(() => {
    if (isOpen) {
      void loadConflicts();
    }
  }, [isOpen]);

  const loadConflicts = async () => {
    setLoading(true);
    try {
      const data = await conflictResolutionService.getUnresolvedConflicts();
      setConflicts(data);
    } catch (error) {
      console.error("Failed to load conflicts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (
    conflictId: number,
    choice: "local" | "remote"
  ) => {
    if (!user) return;

    try {
      await conflictResolutionService.resolveConflict(
        conflictId,
        choice,
        user.id
      );
      await loadConflicts();
      setSelectedConflict(null);
    } catch (error) {
      console.error("Failed to resolve conflict:", error);
      alert("Error resolving conflict. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal_inset">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Sync Conflicts</h2>

        {loading ? (
          <p>Loading conflicts...</p>
        ) : conflicts.length === 0 ? (
          <p>No conflicts to resolve! 🎉</p>
        ) : (
          <div className="space-y-4">
            {conflicts.map((conflict) => (
              <div key={conflict.id} className="border rounded p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{conflict.table_name}</h3>
                    <p className="text-sm text-gray-500">
                      Record ID: {conflict.record_id}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedConflict(
                        selectedConflict?.id === conflict.id ? null : conflict
                      );
                    }}
                    className="text-blue-600 hover:underline"
                  >
                    {selectedConflict?.id === conflict.id
                      ? "Hide"
                      : "Show Details"}
                  </button>
                </div>

                {selectedConflict?.id === conflict.id && (
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div className="border-r pr-4">
                      <h4 className="font-semibold mb-2">Local Version</h4>
                      <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                        {JSON.stringify(conflict.local_version, null, 2)}
                      </pre>
                      <button
                        onClick={() => void handleResolve(conflict.id, "local")}
                        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                      >
                        Use Local
                      </button>
                    </div>

                    <div className="pl-4">
                      <h4 className="font-semibold mb-2">Remote Version</h4>
                      <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto">
                        {JSON.stringify(conflict.remote_version, null, 2)}
                      </pre>
                      <button
                        onClick={() =>
                          void handleResolve(conflict.id, "remote")
                        }
                        className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
                      >
                        Use Remote
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-6 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ConflictResolver;
