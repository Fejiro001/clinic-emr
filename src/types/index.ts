export type UserRole = "doctor" | "secretary" | "nurse" | "admin";
export type SyncOperation = "insert" | "update" | "delete";
export type SyncStatus =
  | "pending"
  | "syncing"
  | "synced"
  | "failed"
  | "conflict";
export type ConflictStrategy =
  | "prefer_recent" // Use version with lateset updated_at
  | "prefer_remote" // Use version from Supabase
  | "prefer_local" // Use version from local SQLite
  | "flag_for_review"; // User must manually resolve

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
}

export interface Patient {
  id: string;
  surname: string;
  other_names: string;
  date_of_birth: string;
  phone: string;
  email?: string;
}

export interface SyncQueueItem {
  id?: number;
  table_name: string;
  record_id: string;
  operation: SyncOperation;
  data: Record<string, unknown>;
  status: SyncStatus;
  retry_count?: number;
  last_retry_at?: number;
  error_message?: string;
  created_at?: number;
  synced_at?: number;
}

export interface ConflictInfo {
  tableName: string;
  recordId: string;
  localData: Record<string, unknown>;
  remoteData: Record<string, unknown>;
  requiresReview: boolean;
  changedFields: FieldConflict[];
}

export interface FieldConflict {
  fieldName: string;
  localValue: unknown;
  remoteValue: unknown;
  strategy: ConflictStrategy;
}

export interface SyncConflict {
  id: number;
  table_name: string;
  record_id: string;
  local_version: Record<string, unknown>;
  remote_version: Record<string, unknown>;
  conflict_type: string;
  resolved: boolean;
  resolution_choice: string;
  resolved_by: string | null;
  resolved_at: string | null;
  timestamp: string;
}

export interface BatchWriteOperation {
  table: string;
  operation: "insert" | "update" | "delete";
  data: Record<string, unknown>;
  recordId: string;
}

export interface FailedItem {
  id: number;
  table_name: string;
  retry_count: number;
  error_message?: string;
  nextRetry?: number;
}
