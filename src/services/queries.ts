import { batchOperationsService } from "./batchOperations";
import type {
  InsertPatient,
  UpdatePatient,
  Patient,
  InpatientRecord,
  Operation,
  OutpatientVisit,
} from "../types/supabase";
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
      data: {
        ...data,
        updated_by: useAuthStore.getState().user?.id ?? null,
      },
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

// =======================
// INPATIENT QUERIES
// =======================
export const inpatientQueries = {
  insert: async (
    data: Omit<
      InpatientRecord,
      "version" | "created_at" | "updated_at" | "deleted_at" | "synced_at"
    >
  ): Promise<boolean> => {
    return await batchOperationsService.executeWrite({
      table: "inpatient_records",
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

  update: async (
    id: string,
    data: Partial<InpatientRecord>
  ): Promise<boolean> => {
    return await batchOperationsService.executeWrite({
      table: "inpatient_records",
      operation: "update",
      recordId: id,
      data: {
        ...data,
        updated_by: useAuthStore.getState().user?.id ?? null,
      },
    });
  },

  findById: async (id: string): Promise<InpatientRecord | undefined> => {
    return await window.db.queryOne<InpatientRecord>(
      `
        SELECT * FROM inpatient_records
        WHERE id = ? AND deleted_at is NULL
    `,
      [id]
    );
  },

  findByPatientId: async (patientId: string): Promise<InpatientRecord[]> => {
    return await window.db.query<InpatientRecord>(
      `
        SELECT * FROM inpatient_records
        WHERE patient_id = ? AND deleted_at is NULL
        ORDER BY date_of_admission DESC
    `,
      [patientId]
    );
  },

  getCurrentlyAdmitted: async (limit = 50, offset = 0) => {
    return await window.db.query(
      `
        SELECT ir.*, p.surname, p.other_names, p.phone 
        FROM inpatient_records ir
        JOIN patients p ON ir.patient_id = p.id
        WHERE ir.date_of_discharge IS NULL 
        AND ir.deleted_at is NULL
        AND p.deleted_at is NULL
        ORDER BY ir.date_of_admission DESC
        LIMIT ? OFFSET ?
    `,
      [limit, offset]
    );
  },

  getByWard: async (ward: string): Promise<InpatientRecord[]> => {
    return await window.db.query<InpatientRecord>(
      `SELECT ir.*, p.surname, p.other_names, p.phone
       FROM inpatient_records ir
       JOIN patients p ON ir.patient_id = p.id
       WHERE ir.ward = ? 
       AND ir.date_of_discharge IS NULL
       AND ir.deleted_at is NULL
       AND p.deleted_at is NULL
       ORDER BY ir.date_of_admission DESC`,
      [ward]
    );
  },

  countAdmitted: async (): Promise<number> => {
    const result = await window.db.queryOne<{ count: number }>(`
        SELECT COUNT(*) AS count 
        FROM inpatient_records
        WHERE date_of_discharge IS NULL
        AND deleted_at is NULL
    `);
    return result?.count ?? 0;
  },

  discharge: async (
    id: string,
    finalDiagnosis: string,
    dischargeDate: string
  ): Promise<boolean> => {
    return await batchOperationsService.executeWrite({
      table: "inpatient_records",
      operation: "update",
      recordId: id,
      data: {
        date_of_discharge: dischargeDate,
        final_diagnosis: finalDiagnosis,
        updated_by: useAuthStore.getState().user?.id ?? null,
      },
    });
  },

  countDischargesOnDate: async (date: string): Promise<number> => {
    const result = await window.db.queryOne<{ count: number }>(
      `
        SELECT COUNT(*) AS count
        FROM inpatient_records
        WHERE date_of_discharge = ? AND deleted_at IS NULL
      `,
      [date]
    );
    return result?.count ?? 0;
  },

  softDelete: async (id: string): Promise<boolean> => {
    return await batchOperationsService.executeWrite({
      table: "inpatient_records",
      operation: "delete",
      recordId: id,
      data: {}, // Empty data for delete operations
    });
  },
};

// =======================
// OPERATIONS QUERIES
// =======================
export const operationQueries = {
  findById: async (id: string): Promise<Operation | undefined> => {
    return await window.db.queryOne<Operation>(
      `
        SELECT * FROM operations
        WHERE id = ? AND deleted_at is NULL
    `,
      [id]
    );
  },

  findByInpatientId: async (
    inpatientRecordId: string
  ): Promise<Operation[]> => {
    return await window.db.query<Operation>(
      `
        SELECT * FROM operations
        WHERE inpatient_record_id = ? AND deleted_at is NULL
        ORDER BY operation_date DESC
    `,
      [inpatientRecordId]
    );
  },

  insert: async (
    data: Omit<
      Operation,
      "version" | "created_at" | "updated_at" | "deleted_at" | "synced_at"
    >
  ): Promise<boolean> => {
    return await batchOperationsService.executeWrite({
      table: "operations",
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

  update: async (id: string, data: Partial<Operation>): Promise<boolean> => {
    return await batchOperationsService.executeWrite({
      table: "operations",
      operation: "update",
      recordId: id,
      data: {
        ...data,
        updated_by: useAuthStore.getState().user?.id ?? null,
      },
    });
  },

  softDelete: async (id: string): Promise<boolean> => {
    return await batchOperationsService.executeWrite({
      table: "operations",
      operation: "delete",
      recordId: id,
      data: {}, // Empty data for delete operations
    });
  },
};

// =======================
// OUTPATIENT QUERIES
// =======================
export const outpatientQueries = {
  insert: async (
    data: Omit<
      OutpatientVisit,
      "version" | "created_at" | "updated_at" | "deleted_at" | "synced_at"
    >
  ): Promise<boolean> => {
    return await batchOperationsService.executeWrite({
      table: "outpatient_visits",
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

  softDelete: async (id: string): Promise<boolean> => {
    return await batchOperationsService.executeWrite({
      table: "outpatient_visits",
      operation: "delete",
      recordId: id,
      data: {}, // Empty data for delete operations
    });
  },

  findById: async (id: string): Promise<OutpatientVisit | undefined> => {
    return await window.db.queryOne<OutpatientVisit>(
      `
        SELECT * FROM outpatient_visits
        WHERE id = ? AND deleted_at is NULL
    `,
      [id]
    );
  },

  findByPatientId: async (patientId: string): Promise<OutpatientVisit[]> => {
    return await window.db.query<OutpatientVisit>(
      `
        SELECT * FROM outpatient_visits
        WHERE patient_id = ? AND deleted_at is NULL
        ORDER BY visit_date DESC, visit_time DESC
    `,
      [patientId]
    );
  },

  getByDateRange: async (
    startDate: string,
    endDate: string,
    limit = 50,
    offset = 0
  ): Promise<OutpatientVisit[]> => {
    return await window.db.query<OutpatientVisit>(
      `
        SELECT ov.*, p.surname, p.other_names, p.phone
        FROM outpatient_visits ov
        JOIN patients p ON ov.patient_id = p.id
        WHERE ov.visit_date BETWEEN ? AND ?
        AND ov.deleted_at is NULL
        AND p.deleted_at is NULL
        ORDER BY ov.visit_date DESC, ov.visit_time DESC
        LIMIT ? OFFSET ?
    `,
      [startDate, endDate, limit, offset]
    );
  },

  getTodayVisits: async (): Promise<OutpatientVisit[]> => {
    const today = new Date().toISOString().split("T")[0];
    return await window.db.query<OutpatientVisit>(
      `
        SELECT ov.*, p.surname, p.other_names, p.phone
        FROM outpatient_visits ov
        JOIN patients p ON ov.patient_id = p.id
        WHERE ov.visit_date = ?
        AND ov.deleted_at is NULL
        AND p.deleted_at is NULL
        ORDER BY ov.visit_time DESC
    `,
      [today]
    );
  },

  countTodayVisits: async (): Promise<number> => {
    const today = new Date().toISOString().split("T")[0];
    const result = await window.db.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM outpatient_visits
       WHERE visit_date = ? AND deleted_at is NULL`,
      [today]
    );
    return result?.count ?? 0;
  },
};

// ===========================
// PATIENT TIMELINE QUERIES
// ===========================
export const timelineQueries = {
  getPatientTimeline: async (patientId: string, limit = 50, offset = 0) => {
    return await window.db.query(
      `SELECT 'inpatient' as type, 
        id, 
        date_of_admission as date,
        NULL as time,
        prov_diagnosis as details,
        ward,
        date_of_discharge
      FROM inpatient_records
      WHERE patient_id = ? AND deleted_at IS NULL
        
      UNION ALL
        
      SELECT 'outpatient' as type,
        id,
        date_of_admission as date,
        visit_date as date,
        visit_time as time,
        diagnosis as details,
        NULL as ward,
        NULL as date_of_discharge
      FROM outpatient_visits
      WHERE patient_id = ? AND deleted_at IS NULL

      ORDER BY date DESC, time DESC
      LIMIT ? OFFSET ?`,
      [patientId, patientId, limit, offset]
    );
  },
};

// ===========================
// DASHBOARD QUERIES
// ===========================
export const dashboardQueries = {
  getStats: async () => {
    const totalPatients = await patientQueries.getCount();
    const currentlyAdmitted = await inpatientQueries.countAdmitted();
    const todayOutpatientVisits = await outpatientQueries.countTodayVisits();
    const dischargesToday = await inpatientQueries.countDischargesOnDate(
      new Date().toISOString().split("T")[0]
    );

    return {
      totalPatients,
      currentlyAdmitted,
      todayOutpatientVisits,
      dischargesToday,
    };
  },
};
