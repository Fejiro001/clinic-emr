CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    unit_number TEXT,
    surname TEXT NOT NULL,
    other_names TEXT NOT NULL,
    date_of_birth TEXT NOT NULL,
    gender TEXT NOT NULL CHECK(gender IN ('male', 'female')),
    address TEXT,
    civil_state TEXT,
    phone TEXT UNIQUE,
    email TEXT,
    occupation TEXT,
    place_of_work TEXT,
    tribe_nationality TEXT,
    next_of_kin TEXT,
    relationship_to_patient TEXT,
    address_next_of_kin TEXT,
    created_by TEXT,
    updated_by TEXT,
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    deleted_at TEXT,
    synced_at TEXT
);

CREATE TABLE IF NOT EXISTS inpatient_records (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    unit_number TEXT,
    related_outpatient_visit_id TEXT,
    ward TEXT NOT NULL,
    consultant_id TEXT,
    code_no TEXT,
    prov_diagnosis TEXT NOT NULL,
    final_diagnosis TEXT,
    date_of_admission TEXT NOT NULL,
    date_of_discharge TEXT,
    created_by TEXT,
    updated_by TEXT,
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    deleted_at TEXT,
    synced_at TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS operations (
    id TEXT PRIMARY KEY,
    inpatient_record_id TEXT NOT NULL,
    operation_name TEXT NOT NULL,
    operation_date TEXT NOT NULL,
    doctor_id TEXT,
    notes TEXT,
    created_by TEXT,
    updated_by TEXT,
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    deleted_at TEXT,
    synced_at TEXT,
    FOREIGN KEY (inpatient_record_id) REFERENCES inpatient_records(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS outpatient_visits (
    id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    unit_number TEXT,
    visit_date TEXT NOT NULL,
    visit_time TEXT NOT NULL,
    history TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    treatment TEXT NOT NULL,
    notes TEXT,
    doctor_id TEXT NOT NULL,
    created_by TEXT,
    updated_by TEXT,
    version INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    deleted_at TEXT,
    synced_at TEXT,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    operation TEXT NOT NULL CHECK(operation IN ('insert', 'update', 'delete')),
    data TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'syncing', 'synced', 'failed', 'conflict')),
    retry_count INTEGER DEFAULT 0,
    last_retry_at INTEGER,
    error_message TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    synced_at INTEGER
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    action TEXT NOT NULL CHECK(action IN ('insert', 'update', 'delete')),
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    old_data TEXT,
    new_data TEXT,
    changes TEXT,
    timestamp INTEGER DEFAULT (strftime('%s', 'now')),
    synced INTEGER DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_patient_phone ON patients(phone) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_patient_identity ON patients(surname, other_names, date_of_birth) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at);
CREATE INDEX IF NOT EXISTS idx_patients_updated_at ON patients(updated_at);

CREATE INDEX IF NOT EXISTS idx_inpatient_patient_id ON inpatient_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_inpatient_admission_date ON inpatient_records(date_of_admission);
CREATE INDEX IF NOT EXISTS idx_inpatient_ward ON inpatient_records(ward);

CREATE INDEX IF NOT EXISTS idx_operations_inpatient ON operations(inpatient_record_id);
CREATE INDEX IF NOT EXISTS idx_operations_date ON operations(operation_date);

CREATE INDEX IF NOT EXISTS idx_outpatient_patient_id ON outpatient_visits(patient_id);
CREATE INDEX IF NOT EXISTS idx_outpatient_visit_date ON outpatient_visits(visit_date);

CREATE INDEX IF NOT EXISTS idx_sync_status ON sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_sync_retry ON sync_queue(status, retry_count);

CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_table_record ON audit_logs(table_name, record_id);