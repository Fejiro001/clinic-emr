import type Database from "better-sqlite3";

export function createIndexes(db: Database.Database): void {
  // Patient Indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_patient_phone ON patients(phone) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_patient_identity ON patients(surname, other_names, date_of_birth) WHERE deleted_at IS NULL;
    CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at);
    CREATE INDEX IF NOT EXISTS idx_patients_updated_at ON patients(updated_at);
  `);

  // Inpatient indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_inpatient_patient_id ON inpatient_records(patient_id);
    CREATE INDEX IF NOT EXISTS idx_inpatient_admission_date ON inpatient_records(date_of_admission);
    CREATE INDEX IF NOT EXISTS idx_inpatient_ward ON inpatient_records(ward);
  `);

  // Operations indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_operations_inpatient ON operations(inpatient_record_id);
    CREATE INDEX IF NOT EXISTS idx_operations_date ON operations(operation_date);
  `);

  // Outpatient indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_outpatient_patient_id ON outpatient_visits(patient_id);
    CREATE INDEX IF NOT EXISTS idx_outpatient_visit_date ON outpatient_visits(visit_date);
  `);

  // Sync queue indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sync_status ON sync_queue(status);
    CREATE INDEX IF NOT EXISTS idx_sync_retry ON sync_queue(status, retry_count);
  `);

  // Audit logs indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
    CREATE INDEX IF NOT EXISTS idx_audit_table_record ON audit_logs(table_name, record_id);
  `);
}
