import { batchOperationsService } from "./batchOperations";
import type { InsertPatient, UpdatePatient, Patient } from "../types/supabase";
import { useAuthStore } from "../store/authStore";

// =======================
// PATIENT QUERIES
// =======================
export const patientQueries = {
  /**
   * Insert a new patient
   */
  insert: async (data: InsertPatient): Promise<boolean> => {
    return await batchOperationsService.executeWrite({
      table: "patients",
      recordId: data.id,
      operation: "insert",
      data: {
        ...data,
        version: 1,
        updated_by: useAuthStore.getState().user?.id ?? null,
        created_by: useAuthStore.getState().user?.id ?? null,
      },
    });
  },

  /**
   * Find patient by ID
   */
  findById: async (id: string): Promise<Patient | undefined> => {
    return await window.db.queryOne<Patient>(
      `
        SELECT * FROM patients
        WHERE id = ? AND deleted_at is NULL
    `,
      [id]
    );
  },

  /**
   * Find patient by phone (for duplicate detection)
   */
  findByPhone: async (phone: string): Promise<Patient | undefined> => {
    return window.db.queryOne<Patient>(
      `
        SELECT * FROM patients
        WHERE phone = ? AND deleted_at IS NULL
      `,
      [phone]
    );
  },

  /**
   * Find patient by name and DOB (for duplicate detection)
   */
  findByNameAndDOB: async (
    surname: string,
    other_names: string,
    date_of_birth: string
  ): Promise<Patient | undefined> => {
    return await window.db.queryOne<Patient>(
      `
        SELECT * FROM patients
        WHERE surname = ? AND other_names = ? AND date_of_birth = ? AND deleted_at IS NULL
    `,
      [surname, other_names, date_of_birth]
    );
  },

  /**
   * Search patients by name or phone
   */
  search: async (
    searchTerm: string,
    limit = 50,
    offset = 0
  ): Promise<Patient[]> => {
    const term = `%${searchTerm}%`;
    return await window.db.query<Patient>(
      `
        SELECT * FROM patients
        WHERE (
            surname LIKE ? OR
            other_names LIKE ? OR
            phone LIKE ?
        ) AND deleted_at IS NULL
         ORDER BY updated_at DESC
         LIMIT ? OFFSET ?
    `,
      [term, term, term, limit, offset]
    );
  },

  /**
   * Get all patients with pagination
   */
  getAll: async (limit = 50, offset = 0): Promise<Patient[]> => {
    return await window.db.query<Patient>(
      `
        SELECT * FROM patients
        WHERE deleted_at IS NULL
        ORDER BY updated_at DESC
        LIMIT ? OFFSET ?
        `,
      [limit, offset]
    );
  },

  /**
   * Get total patients count
   */
  getCount: async (): Promise<number> => {
    const result = await window.db.queryOne<{ count: number }>(`
        SELECT COUNT(*) AS count FROM patients
        WHERE deleted_at IS NULL
    `);
    return result?.count ?? 0;
  },

  /**
   * Update patient record
   */
  updateRecord: async (id: string, data: UpdatePatient): Promise<boolean> => {
    return await batchOperationsService.executeWrite({
      table: "patients",
      operation: "update",
      recordId: id,
      data: data,
    });
  },

  /**
   * Soft delete patient
   */
  softDelete: async (id: string): Promise<boolean> => {
    return await batchOperationsService.executeWrite({
      table: "patients",
      operation: "delete",
      recordId: id,
      data: {}, // Empty data for delete operations
    });
  },
};
