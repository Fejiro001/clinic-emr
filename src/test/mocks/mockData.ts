import type { SyncQueueItem, UserProfile } from "../../types";

export const mockUser: UserProfile = {
  id: "user-123",
  email: "doctor@clinic.com",
  full_name: "Dr. John Doe",
  role: "doctor",
};

export const mockPatient = {
  id: "patient-123",
  surname: "Smith",
  other_names: "John",
  date_of_birth: "1990-01-15",
  gender: "male" as const,
  phone: "1234567890",
  address: "123 Main St.",
  created_by: "user-123",
  updated_by: "user-123",
  version: 1,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z",
  deleted_at: null,
  synced_at: null,
};

export const mockSyncQueueItem: SyncQueueItem = {
  id: 1,
  table_name: "patients",
  record_id: "patient-123",
  operation: "insert",
  data: mockPatient,
  status: "pending",
  retry_count: 0,
  created_at: Date.now(),
};

export const mockConflict = {
  id: 1,
  table_name: "patients",
  record_id: "patient-123",
  local_version: { ...mockPatient, phone: "07088852002" },
  remote_version: { ...mockPatient, phone: "08075853868" },
  conflict_type: "field_mismatch",
  resolved: false,
  timestamp: Date.now(),
};
