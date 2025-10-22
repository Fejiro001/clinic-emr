# Clinic EMR - Detailed Development Plan (Revised)

## Project Overview

A cross-platform desktop EMR system for managing patient data across clinic computers with offline-first synchronization. This plan focuses on building a Solid Foundation (Version 1.0) with all core features, security, data integrity, and robust sync engine included from the start.

## Tech Stack (Final - Complete)

- **Desktop Framework:** Electron
- **Frontend UI:** React + Tailwind CSS
- **State Management:** Zustand (global UI state)
- **Data Fetching:** React Query + Supabase Client
- **Form Management:** React Hook Form + Zod (validation)
- **Table Management:** Tanstack Table (with pagination)
- **Backend:** Supabase (PostgreSQL + Auth + Real-time)
- **Local Database:** SQLite (via better-sqlite3)
- **ORM:** sql template literals with better-sqlite3
- **Build Tools:** Vite, Electron Builder
- **Language:** TypeScript (for type safety)
- **Utilities:**
  - `nanoid` (UUID generation)
  - `axios` (HTTP client)
  - `electron.safeStorage` (password encryption)
- **IPC Communication:** Electron IPC (batched queries)
- **Network Detection:** Custom Electron IPC handler
- **Conflict Resolution:** Custom CRDT-inspired resolver

---

## Phase 1: Solid Foundation (10-12 weeks) - REVISED

### 1.1 Project Setup (Week 1)

- [x] Initialize Electron + React + TypeScript with Vite
- [x] Set up Tailwind CSS, React Hook Form, Zod
- [x] Install all packages (better-sqlite3, axios, nanoid, etc.)
- [x] Configure ESLint, Prettier, TypeScript
- [x] Initialize Git repository and .env.local
- [x] Set up electron-rebuild for native modules (better-sqlite3)
- [x] Create Electron IPC architecture skeleton

### 1.2 Supabase & Security Setup (Week 1-2)

- [x] Create Supabase project
- [x] Create all database tables with proper constraints
- [x] Create database indexes (phone, DOB, dates)
- [x] Define and test all RLS policies for each role
- [x] Create PostgreSQL triggers for audit logs
- [x] Create sync_conflicts (PostgreSQL side)
- [x] Create sync_queue tables (SQLite side)
- [x] Create API keys and configure .env.local

### 1.3 Local Database & Migrations (Week 2)

- [x] Set up SQLite in Electron (better-sqlite3)
- [x] Create migration system for SQLite and Supabase
- [x] Create migration files (schema, indexes, soft deletes)
- [x] Test migrations on fresh install
- [x] Create migration runner that auto-runs on startup

### 1.4 Authentication & Session Management (Week 2)

- [ ] Build login page with email/password
- [ ] Integrate Supabase Auth
- [ ] Implement role-based route protection
- [ ] Implement role-based UI component hiding
- [ ] Set up session refresh logic
- [ ] Implement logout
- [ ] Set up 30-minute inactivity timeout
- [ ] Add Electron safeStorage for token encryption
- [ ] Test RLS policies (log in as different roles, verify access)

### 1.5 Network Detection & Offline State (Week 3)

- [ ] Create Electron IPC handler for network status
- [ ] Set up Zustand store for offline mode
- [ ] Add online/offline event listeners
- [ ] Create UI indicator for sync/offline status
- [ ] Test network transitions (online → offline → online)

### 1.6 Sync Queue & Batching (Week 3)

- [ ] Create SQLite sync_queue table (local)
- [ ] Build write queue system for offline operations
- [ ] Implement batched IPC queries (renderer → main → SQLite)
- [ ] Implement batched API calls to Supabase (max 50 items/batch)
- [ ] Test queue persistence on app close/restart
- [ ] Test batching performance

### 1.7 Conflict Detection & Resolution (Week 4)

- [ ] Define CONFLICT_RULES for each table (as above)
- [ ] Implement conflict detection logic (version/timestamp comparison)
- [ ] Create sync_conflicts table queries
- [ ] Build conflict resolution UI (show conflicts, let user choose)
- [ ] Implement auto-resolution rules (prefer_recent, prefer_remote, etc.)
- [ ] Test conflict scenarios (edit same field offline, sync, resolve)

### 1.8 Retry Logic & Exponential Backoff (Week 4)

- [ ] Implement retry counter in sync_queue
- [ ] Calculate exponential backoff (2^n seconds, max 5 min)
- [ ] Implement automatic retry on app startup if failed syncs exist
- [ ] Build "retry" button in UI for manual retry
- [ ] Test retry scenarios (network timeout, server error, then recovery)

### 1.9 Patient Registry (Week 5)

- [ ] Create patient registry list page (view/search only)
- [ ] Implement pagination (infinite scroll, 50 items/page)
- [ ] Build search by name/phone/DOB
- [ ] Create patient detail view with medical history
- [ ] Implement soft deletes (exclude deleted_at IS NOT NULL)
- [ ] Add pagination to patient history timeline
- [ ] Test with 1000+ test patients

### 1.10 Inpatient Management (Week 5-6)

- [ ] Create inpatient admission form (2 sections: patient + admission)
- [ ] Implement duplicate patient detection (phone/name+DOB)
- [ ] Implement auto-create patient if not exists
- [ ] Add comprehensive Zod validation
- [ ] Create discharge form
- [ ] Create operations form (separate table for operations)
- [ ] Build inpatient list with filters (ward, consultant, date range)
- [ ] Test offline admission creation → sync
- [ ] Test conflict scenarios during sync

### 1.11 Outpatient Management (Week 6-7)

- [ ] Create outpatient visit form (2 sections: patient + visit)
- [ ] Implement duplicate patient detection
- [ ] Implement auto-create patient if not exists
- [ ] Add comprehensive Zod validation
- [ ] Build outpatient visit list with pagination
- [ ] Implement "Admit to Hospital" button
- [ ] Test offline visit creation → sync
- [ ] Test visit immutability (can't edit after creation)

### 1.12 Outpatient → Inpatient Conversion (Week 7)

- [ ] Implement "Admit" button on outpatient visits
- [ ] Pre-populate inpatient form with patient data
- [ ] Copy diagnosis to provisional diagnosis
- [ ] Set related_outpatient_visit_id
- [ ] Test conversion workflow online and offline
- [ ] Verify audit log captures both records

### 1.13 Patient Timeline & History (Week 8)

- [ ] Build unified chronological timeline view
- [ ] Show all inpatient admissions (with discharge status)
- [ ] Show all outpatient visits
- [ ] Show links between outpatient → inpatient conversions
- [ ] Paginate timeline (load 50 at a time)
- [ ] Test with patient having 100+ visits

### 1.14 Audit Logs & Compliance (Week 9)

- [ ] Verify PostgreSQL triggers auto-log all changes
- [ ] Build audit log viewer (admin only)
- [ ] Show: user, action, timestamp, old/new data
- [ ] Filter audit logs by date, user, table, record
- [ ] Test that all operations are logged
- [ ] Verify soft deletes create audit entries

### 1.15 Dashboard (Week 10)

- [ ] Create stats cards (total patients, admitted, visits today)
- [ ] Implement metrics that auto-update (React Query)
- [ ] Add conversion metrics widget
- [ ] Test performance with large datasets
- [ ] Ensure stats update in real-time when data changes

### 1.16 Documentation & Deployment (Week 11)

- [ ] Create user guides for each role (Doctor, Secretary, Nurse)
- [ ] Write deployment guide for clinic IT
- [ ] Create installer (Windows, Mac, Linux)
- [ ] Test installer on clean machines
- [ ] Write troubleshooting guide
- [ ] Create video tutorial for staff

### 1.17 Comprehensive Testing (Week 12)

- [ ] Test offline workflows (admission, visit, no internet)
- [ ] Test sync scenarios (conflicts, retries, batching)
- [ ] Test RLS policies (logged in as each role)
- [ ] Test duplicate detection (same patient created twice)
- [ ] Test data integrity (foreign keys, constraints)
- [ ] Test performance with 10,000+ patients
- [ ] Stress test: 5 concurrent users on same wifi
- [ ] Test update/rollback scenarios
- [ ] Security audit (password storage, token handling)
- [ ] Fix bugs and performance issues

---

## Project Structure (Complete)

```
clinic-emr/
├── public/
│   ├── icon.png
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── Layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── Header.tsx
│   │   ├── Auth/
│   │   │   └── LoginForm.tsx
│   │   ├── Patients/
│   │   │   ├── PatientList.tsx
│   │   │   ├── PatientForm.tsx
│   │   │   ├── PatientDetail.tsx
│   │   │   └── PatientTimeline.tsx
│   │   ├── Inpatient/
│   │   │   ├── InpatientList.tsx
│   │   │   ├── InpatientForm.tsx
│   │   │   ├── AdmissionForm.tsx
│   │   │   ├── OperationsForm.tsx
│   │   │   └── DischargeForm.tsx
│   │   ├── Outpatient/
│   │   │   ├── OutpatientList.tsx
│   │   │   ├── OutpatientForm.tsx
│   │   │   └── VisitDetail.tsx
│   │   ├── Common/
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorMessage.tsx
│   │   │   ├── SyncStatus.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── ConflictResolver.tsx
│   │   │   └── Pagination.tsx
│   │   └── Admin/
│   │       └── AuditLogViewer.tsx
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── PatientsPage.tsx
│   │   ├── InpatientPage.tsx
│   │   ├── OutpatientPage.tsx
│   │   ├── LoginPage.tsx
│   │   └── AuditLogsPage.tsx
│   ├── services/
│   │   ├── supabase.ts (Supabase client + auth)
│   │   ├── sync.ts (Sync engine logic)
│   │   ├── auth.ts (Auth helpers)
│   │   ├── patients.ts (Patient CRUD + duplicate detection)
│   │   ├── inpatient.ts (Admission/discharge logic)
│   │   ├── outpatient.ts (Visit CRUD)
│   │   ├── operations.ts (Operations CRUD)
│   │   ├── conversion.ts (Outpatient → Inpatient)
│   │   ├── medicalHistory.ts (Timeline queries)
│   │   ├── auditLogs.ts (Audit log queries)
│   │   ├── conflicts.ts (Conflict resolution)
│   │   ├── validation.ts (All Zod schemas)
│   │   └── dashboard.ts (Dashboard stats)
│   ├── store/
│   │   ├── authStore.ts (User, role, session)
│   │   ├── syncStore.ts (Sync status, conflicts, offline mode)
│   │   ├── patientStore.ts (Patient cache)
│   │   ├── inpatientStore.ts (Inpatient cache)
│   │   ├── outpatientStore.ts (Outpatient cache)
│   │   └── uiStore.ts (Modal state, toasts, loading)
│   ├── db/
│   │   ├── database.ts (SQLite initialization)
│   │   ├── schema.ts (SQLite schema definitions)
│   │   ├── migrations.ts (Migration runner)
│   │   ├── queries.ts (All SQLite queries)
│   │   └── indexes.ts (Create Indexes)
│   ├── hooks/
│   │   ├── useAuth.ts (Auth context hook)
│   │   ├── useSyncStatus.ts (Sync status hook)
│   │   ├── useOfflineMode.ts (Offline detection)
│   │   ├── usePatientTimeline.ts (Patient history)
│   │   ├── useConversion.ts (Admission conversion)
│   │   ├── useConflicts.ts (Conflict detection/resolution)
│   │   ├── usePagination.ts (Generic pagination)
│   │   └── useDebounce.ts (Search debounce)
│   ├── utils/
│   │   ├── dateUtils.ts (Date formatting, age calculation)
│   │   ├── constants.ts (Enums, role definitions)
│   │   ├── logger.ts (Debug logging)
│   │   └── errors.ts (Custom error classes)
│   ├── types/
│   │   ├── index.ts (All TypeScript interfaces)
│   │   └── supabase.ts (Generated Supabase types)
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── electron/
│   ├── main.ts (Electron main process)
│   ├── preload.ts (Secure context bridge)
│   ├── ipc/
│   │   ├── database.ts (DB query handlers - batched)
│   │   ├── network.ts (Online/offline detection)
│   │   ├── auth.ts (Token encryption/decryption)
│   │   └── sync.ts (Sync coordination)
│   └── security.ts (Security utilities)
├── migrations/
│   ├── 001_initial_schema.sql
│   ├── 002_add_indexes.sql
│   ├── 003_add_soft_deletes.sql
│   ├── 004_add_audit_logs.sql
│   ├── 005_add_sync_tables.sql
│   └── 006_add_rls_policies.sql
├── public/
│   └── icon.png
├── .env.example
├── .env.local (git-ignored)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── electron-builder.json
├── .eslintrc.json
├── prettier.config.json
└── README.md
```

---

## Complete Package.json Dependencies

```json
{
  "name": "celian_clinic_emr",
  "author": "Abere Oghenefejiro",
  "private": true,
  "version": "0.0.0",
  "main": "dist-electron/electron/main.js",
  "homepage": "./",
  "license": "MIT",
  "scripts": {
    "dev": "vite",
    "electron:start": "wait-on tcp:5173 && set VITE_DEV_SERVER_URL=http://localhost:5173/ && electron .",
    "electron:main-watch": "tsc -w -p tsconfig.electron.json",
    "electron-dev": "concurrently \"npm run dev\" \"npm run electron:main-watch\" \"npm run electron:start\"",
    "rebuild": "electron-rebuild -f -w better-sqlite3",
    "electron": "wait-on tcp:5173 && electron .",
    "build": "npm run rebuild && tsc -p tsconfig.electron.json && vite build",
    "electron-build": "npm run build && electron-builder",
    "lint": "eslint .",
    "format": "eslint . --fix",
    "preview": "vite preview"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@supabase/supabase-js": "^2.75.1",
    "@tailwindcss/vite": "^4.1.14",
    "@tanstack/react-query": "^5.90.5",
    "@tanstack/react-table": "^8.21.3",
    "axios": "^1.12.2",
    "better-sqlite3": "^12.4.1",
    "electron-is-dev": "^3.0.1",
    "electron-store": "^11.0.2",
    "nanoid": "^5.1.6",
    "react": "^19.1.1",
    "react-dom": "^19.1.1",
    "react-hook-form": "^7.65.0",
    "tailwindcss": "^4.1.14",
    "zod": "^4.1.12",
    "zustand": "^5.0.8"
  },
  "devDependencies": {
    "@electron/rebuild": "^4.0.1",
    "@eslint/js": "^9.36.0",
    "@types/better-sqlite3": "^7.6.13",
    "@types/node": "^24.6.0",
    "@types/react": "^19.1.16",
    "@types/react-dom": "^19.1.9",
    "@vitejs/plugin-react": "^5.0.4",
    "concurrently": "^9.2.1",
    "electron": "^38.3.0",
    "electron-builder": "^26.0.12",
    "eslint": "^9.36.0",
    "eslint-plugin-react-hooks": "^5.2.0",
    "eslint-plugin-react-refresh": "^0.4.22",
    "globals": "^16.4.0",
    "prettier": "^3.6.2",
    "typescript": "~5.9.3",
    "typescript-eslint": "^8.45.0",
    "vite": "^7.1.7",
    "wait-on": "^9.0.1"
  },
  "build": {
    "appId": "com.celianclinic.clinicemr",
    "productName": "Clinic EMR",
    "files": [
      "dist/**/*",
      "dist-electron/**/*",
      "node_modules/better-sqlite3/**/*"
    ],
    "directories": {
      "buildResources": "public"
    },
    "win": {
      "target": ["nsis", "portable"]
    },
    "nsis": {
      "oneClick": false,
      "allowToChangeInstallationDirectory": true
    }
  }
}
```

---

## Duplicate Patient Detection Algorithm

```typescript
// services/patients.ts

export async function detectDuplicatePatient(newPatient: {
  surname: string;
  other_names: string;
  date_of_birth: Date;
  phone: string;
}) {
  // Check 1: Exact phone match (most reliable)
  const phoneMatch = await supabase
    .from("patients")
    .select("id")
    .eq("phone", newPatient.phone)
    .is("deleted_at", null)
    .single();

  if (phoneMatch) {
    return {
      duplicate: true,
      reason: "phone_match",
      existingId: phoneMatch.id,
    };
  }

  // Check 2: Name + DOB match (strong indicator)
  const nameMatch = await supabase
    .from("patients")
    .select("id")
    .eq("surname", newPatient.surname)
    .eq("other_names", newPatient.other_names)
    .eq("date_of_birth", newPatient.date_of_birth)
    .is("deleted_at", null)
    .single();

  if (nameMatch) {
    return {
      duplicate: true,
      reason: "name_dob_match",
      existingId: nameMatch.id,
    };
  }

  // Check 3: Fuzzy match on surname (optional, catch typos)
  // Could use postgres extension or client-side library

  return { duplicate: false };
}

export async function createOrGetPatient(patientData: PatientInput) {
  const duplicateCheck = await detectDuplicatePatient(patientData);

  if (duplicateCheck.duplicate) {
    // Return existing patient
    const existing = await supabase
      .from("patients")
      .select("*")
      .eq("id", duplicateCheck.existingId)
      .single();

    return {
      patient: existing,
      isNew: false,
      duplicateReason: duplicateCheck.reason,
    };
  }

  // Create new patient
  const newPatient = await supabase
    .from("patients")
    .insert([
      {
        ...patientData,
        created_by: currentUserId,
        updated_by: currentUserId,
        version: 1,
      },
    ])
    .select()
    .single();

  return { patient: newPatient, isNew: true };
}
```

---

## Offline Duplicate Detection (SQLite)

```typescript
// When creating patient offline:

export async function createPatientOffline(patientData: PatientInput) {
  const db = getDatabase(); // SQLite

  // Check for existing patient locally first
  const existing = db
    .prepare(
      `
    SELECT id FROM patients 
    WHERE phone = ? OR (surname = ? AND other_names = ? AND date_of_birth = ?)
    AND deleted_at IS NULL
  `
    )
    .get(
      patientData.phone,
      patientData.surname,
      patientData.other_names,
      patientData.date_of_birth
    );

  if (existing) {
    return { patient: existing, isNew: false, duplicate: true };
  }

  // Create locally
  const patientId = nanoid();
  db.prepare(
    `
    INSERT INTO patients (
      id, surname, other_names, date_of_birth, phone, created_by, updated_by, version
    ) VALUES (?, ?, ?, ?, ?, ?, ?, 1)
  `
  ).run(
    patientId,
    patientData.surname,
    patientData.other_names,
    patientData.date_of_birth,
    patientData.phone,
    userId,
    userId
  );

  // Add to sync queue
  db.prepare(
    `
    INSERT INTO sync_queue (table_name, record_id, operation, data, status)
    VALUES (?, ?, 'insert', ?, 'pending')
  `
  ).run("patients", patientId, JSON.stringify(patientData));

  return {
    patient: { id: patientId, ...patientData },
    isNew: true,
    duplicate: false,
  };
}
```

---

## Complete Sync Flow (Pseudocode)

```typescript
// services/sync.ts

export async function syncAllChanges() {
  if (!isOnline) {
    console.log("Offline, sync will happen when online");
    return;
  }

  try {
    // Get all pending items from local queue
    const pending = db
      .prepare(
        `
      SELECT * FROM sync_queue 
      WHERE status IN ('pending', 'failed')
      ORDER BY created_at ASC
      LIMIT 50
    `
      )
      .all();

    if (pending.length === 0) {
      updateSyncStatus("synced");
      return;
    }

    updateSyncStatus("syncing");

    // Batch send to server
    const response = await axios.post("/api/sync/batch", {
      items: pending.map((item) => ({
        table: item.table_name,
        operation: item.operation,
        id: item.record_id,
        data: JSON.parse(item.data),
      })),
    });

    // Handle response item by item
    for (let i = 0; i < response.data.results.length; i++) {
      const result = response.data.results[i];
      const item = pending[i];

      if (result.success) {
        // Check for conflicts
        if (result.conflict) {
          createConflict({
            table_name: item.table_name,
            record_id: item.record_id,
            local_version: JSON.parse(item.data),
            remote_version: result.remoteVersion,
            conflict_type: result.conflictType,
          });

          db.prepare(
            `
            UPDATE sync_queue SET status = 'conflict'
            WHERE id = ?
          `
          ).run(item.id);
        } else {
          // Update local record with server version
          db.prepare(
            `
            UPDATE ${item.table_name}
            SET version = ?, updated_at = ?, synced_at = ?
            WHERE id = ?
          `
          ).run(
            result.version,
            result.updated_at,
            new Date().toISOString(),
            item.record_id
          );

          // Mark as synced
          db.prepare(
            `
            UPDATE sync_queue SET status = 'synced', synced_at = ?
            WHERE id = ?
          `
          ).run(Date.now(), item.id);
        }
      } else {
        // Sync failed
        const retryCount = (item.retry_count || 0) + 1;
        const backoffTime = Math.min(Math.pow(2, retryCount) * 1000, 300000); // Max 5 mins

        db.prepare(
          `
          UPDATE sync_queue 
          SET status = 'failed', retry_count = ?, last_retry_at = ?, error_message = ?
          WHERE id = ?
        `
        ).run(retryCount, Date.now() + backoffTime, result.error, item.id);
      }
    }

    // Recursively sync more if there are pending items
    if (pending.length === 50) {
      await syncAllChanges();
    } else {
      updateSyncStatus("synced");
    }
  } catch (error) {
    updateSyncStatus("error");
    console.error("Sync error:", error);
  }
}

export async function resolveConflict(
  conflictId: string,
  choice: "local" | "remote"
) {
  const conflict = await supabase
    .from("sync_conflicts")
    .select("*")
    .eq("id", conflictId)
    .single();

  if (choice === "remote") {
    // Update local record with remote version
    db.prepare(
      `
      UPDATE ${conflict.table_name}
      SET ${Object.keys(conflict.remote_version)
        .map((k) => `${k} = ?`)
        .join(", ")}
      WHERE id = ?
    `
    ).run(...Object.values(conflict.remote_version), conflict.record_id);
  }
  // If choice === 'local', keep local as is

  // Mark as resolved
  await supabase
    .from("sync_conflicts")
    .update({ resolved: true, resolution_choice: choice, resolved_by: userId })
    .eq("id", conflictId);

  // Retry sync
  await syncAllChanges();
}
```

---

## Key Implementation Details

### 1. Transactional Safety (Offline)

```typescript
// When creating patient + visit offline:
export async function createVisitWithPatient(patientData, visitData) {
  const db = getDatabase();

  try {
    db.prepare('BEGIN TRANSACTION').run();

    const patientId = nanoid();
    // Insert patient
    db.prepare('INSERT INTO patients (...) VALUES (...)').run(...);

    // Insert visit
    db.prepare('INSERT INTO outpatient_visits (...) VALUES (...)').run(...);

    // Add both to sync queue
    db.prepare('INSERT INTO sync_queue (...) VALUES (...)').run(...);
    db.prepare('INSERT INTO sync_queue (...) VALUES (...)').run(...);

    db.prepare('COMMIT').run();
    return { patientId, visitId };
  } catch (error) {
    db.prepare('ROLLBACK').run();
    throw error;
  }
}
```

### 2. Audit Log Triggers (PostgreSQL)

```sql
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, new_data, timestamp)
    VALUES (auth.uid(), 'insert', TG_TABLE_NAME, NEW.id, row_to_json(NEW), NOW());
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, new_data, changes, timestamp)
    VALUES (auth.uid(), 'update', TG_TABLE_NAME, NEW.id, row_to_json(OLD), row_to_json(NEW),
            jsonb_object_agg(key, value) FROM each(hstore(NEW) - hstore(OLD)), NOW());
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_logs (user_id, action, table_name, record_id, old_data, timestamp)
    VALUES (auth.uid(), 'delete', TG_TABLE_NAME, OLD.id, row_to_json(OLD), NOW());
  END IF;
  RETURN NULL;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to all tables:
CREATE TRIGGER patients_audit AFTER INSERT OR UPDATE OR DELETE ON patients FOR EACH ROW EXECUTE FUNCTION audit_trigger();
CREATE TRIGGER inpatient_records_audit AFTER INSERT OR UPDATE OR DELETE ON inpatient_records FOR EACH ROW EXECUTE FUNCTION audit_trigger();
-- ... etc for all tables
```

---

## Development Workflow (Revised)

1. **Week 1-2**: Setup + Auth + Security
2. **Week 3-4**: Sync Engine + Conflict Resolution + Retry Logic
3. **Week 5-6**: Inpatient Module (with operations table)
4. **Week 6-7**: Outpatient Module + Conversion
5. **Week 8**: Patient Timeline + Audit Logs
6. **Week 9**: Dashboard + Admin Panel
7. **Week 10**: Documentation + Deployment
8. **Week 11-12**: Testing (offline, sync, RLS, performance, security)

---

## Critical Testing Checklist

- [ ] Create patient offline, then go online, verify sync succeeds
- [ ] Two users create same patient offline (phone match), sync detects duplicate
- [ ] Edit patient field locally, another user edits same field remotely, conflict detected and resolved
- [ ] Network fails mid-sync, app retries with exponential backoff
- [ ] Admission created offline, syncs successfully
- [ ] Convert outpatient to inpatient, verify related_outpatient_visit_id is set
- [ ] Delete patient (soft delete), verify audit log captures it
- [ ] Receptionist tries to view doctor-only diagnosis field (RLS blocks it)
- [ ] App closes with pending sync items, reopens and continues sync
- [ ] 1000 patient list loads smoothly with pagination
- [ ] 100+ patient visits in timeline paginate correctly
- [ ] Audit log shows all operations with user/timestamp

---

## Next Steps

1. **Create Supabase project and run migrations**
2. **Set up Electron + React + TypeScript skeleton**
3. **Implement authentication and RLS policies**
4. **Build sync engine and conflict resolution**
5. **Create patient/inpatient/outpatient forms**
6. **Comprehensive testing and performance optimization**

---

## Database Schema (Supabase PostgreSQL - COMPLETE)

### Users Table

```sql
id (UUID, PK)
email (unique)
password (hashed by Supabase Auth)
full_name
role (ENUM: doctor, secretary, nurse, admin)
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
```

### Patients Table

```sql
id (UUID, PK)
surname (TEXT, NOT NULL)
other_names (TEXT, NOT NULL)
date_of_birth (DATE, NOT NULL)
gender (ENUM: male, female, NOT NULL)
address (TEXT)
civil_state (TEXT)
phone (TEXT, UNIQUE) -- For duplicate detection
email (TEXT, nullable)
occupation (TEXT)
place_of_work (TEXT)
tribe_nationality (TEXT)
next_of_kin (TEXT)
relationship_to_patient (TEXT)
address_next_of_kin (TEXT)
clinic_id (UUID, FK)
created_by (UUID, FK to Users) -- Who created this patient
updated_by (UUID, FK to Users) -- Who last updated
version (INT DEFAULT 1) -- Optimistic locking
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
deleted_at (TIMESTAMPTZ, nullable) -- Soft delete
synced_at (TIMESTAMPTZ) -- For sync tracking
-- Indexes for duplicate detection and performance
UNIQUE INDEX idx_patient_identity ON (surname, other_names, date_of_birth)
UNIQUE INDEX idx_patient_phone ON (phone)
INDEX idx_patients_created_at ON (created_at DESC)
INDEX idx_patients_updated_at ON (updated_at DESC)
INDEX idx_patients_deleted_at ON (deleted_at)
```

### Inpatient Records Table

```sql
id (UUID, PK)
patient_id (UUID, FK to Patients, NOT NULL)
related_outpatient_visit_id (UUID, FK to Outpatient Visits, nullable)
unit_number (TEXT)
ward (TEXT, NOT NULL)
consultant_id (UUID, FK to Users)
code_no (TEXT)
prov_diagnosis (TEXT, NOT NULL)
final_diagnosis (TEXT, nullable) -- Set on discharge
date_of_admission (DATE, NOT NULL)
date_of_discharge (DATE, nullable) -- Set when discharged
clinic_id (UUID, FK)
created_by (UUID, FK to Users)
updated_by (UUID, FK to Users)
version (INT DEFAULT 1)
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
deleted_at (TIMESTAMPTZ, nullable)
synced_at (TIMESTAMPTZ)
-- Indexes
INDEX idx_inpatient_patient_id ON (patient_id)
INDEX idx_inpatient_admission_date ON (date_of_admission DESC)
INDEX idx_inpatient_discharge_date ON (date_of_discharge DESC)
INDEX idx_inpatient_ward ON (ward)
INDEX idx_inpatient_consultant ON (consultant_id)
```

### Operations Table

```sql
id (UUID, PK)
inpatient_record_id (UUID, FK to Inpatient Records, NOT NULL)
operation_name (TEXT, NOT NULL)
operation_date (DATE, NOT NULL)
doctor_id (UUID, FK to Users, nullable)
notes (TEXT, nullable)
created_by (UUID, FK to Users)
updated_by (UUID, FK to Users)
version (INT DEFAULT 1)
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
deleted_at (TIMESTAMPTZ, nullable)
synced_at (TIMESTAMPTZ)
-- Indexes
INDEX idx_operations_inpatient ON (inpatient_record_id)
INDEX idx_operations_date ON (operation_date DESC)
INDEX idx_operations_doctor ON (doctor_id)
```

### Outpatient Visits Table

```sql
id (UUID, PK)
patient_id (UUID, FK to Patients, NOT NULL)
visit_date (DATE, NOT NULL)
visit_time (TIME, NOT NULL)
history (TEXT, NOT NULL) -- Patient complaints
diagnosis (TEXT, NOT NULL)
treatment (TEXT, NOT NULL)
notes (TEXT, nullable)
doctor_id (UUID, FK to Users, NOT NULL)
clinic_id (UUID, FK)
created_by (UUID, FK to Users)
updated_by (UUID, FK to Users)
version (INT DEFAULT 1)
created_at (TIMESTAMPTZ)
updated_at (TIMESTAMPTZ)
deleted_at (TIMESTAMPTZ, nullable) -- Soft delete (immutable after creation)
synced_at (TIMESTAMPTZ)
-- Indexes
INDEX idx_outpatient_patient_id ON (patient_id)
INDEX idx_outpatient_visit_date ON (visit_date DESC)
INDEX idx_outpatient_doctor_id ON (doctor_id)
```

### Audit Logs Table (PostgreSQL Triggers Auto-Populate)

```sql
id (BIGSERIAL, PK)
user_id (UUID, FK to Users)
action (ENUM: insert, update, delete)
table_name (TEXT) -- patients, inpatient_records, outpatient_visits, operations
record_id (UUID)
old_data (JSONB, nullable) -- Full previous record
new_data (JSONB, nullable) -- Full new record
changes (JSONB, nullable) -- Only changed fields
timestamp (TIMESTAMPTZ DEFAULT NOW())
synced (BOOLEAN DEFAULT FALSE) -- For local offline audit logs
-- Index for querying
INDEX idx_audit_timestamp ON (timestamp DESC)
INDEX idx_audit_table_record ON (table_name, record_id)
INDEX idx_audit_user ON (user_id)
INDEX idx_audit_action ON (action)
```

### Sync Conflicts Table (For Resolution)

```sql
id (BIGSERIAL, PK)
table_name (TEXT)
record_id (UUID)
local_version (JSONB) -- Device version
remote_version (JSONB) -- Server version
conflict_type (ENUM: field_mismatch, timestamp_mismatch, deletion_conflict)
resolved (BOOLEAN DEFAULT FALSE)
resolution_choice (TEXT) -- 'local' or 'remote' or 'merged'
resolved_by (UUID, FK to Users, nullable)
resolved_at (TIMESTAMPTZ, nullable)
timestamp (TIMESTAMPTZ DEFAULT NOW())
-- Index
INDEX idx_sync_conflicts_resolved ON (resolved)
INDEX idx_sync_conflicts_table ON (table_name, record_id)
```

### Sync Queue Table (Local SQLite Only)

```sql
id (INTEGER, PK)
table_name (TEXT NOT NULL)
record_id (TEXT NOT NULL) -- UUID as TEXT
operation (TEXT NOT NULL) -- insert, update, delete
data (JSON NOT NULL) -- Full record for sync
status (TEXT DEFAULT 'pending') -- pending, syncing, synced, failed, conflict
retry_count (INTEGER DEFAULT 0)
last_retry_at (INTEGER) -- Unix timestamp
error_message (TEXT, nullable)
created_at (INTEGER) -- Unix timestamp
synced_at (INTEGER, nullable)
-- Index
INDEX idx_status ON (status)
INDEX idx_retry ON (status, retry_count)
```

---

## Row Level Security (RLS) Policies (Supabase)

### Patients Table

```sql
-- Doctors and Secretaries can read all patients
CREATE POLICY "read_patients" ON patients
FOR SELECT USING (true);

-- Only creators can update their own patient records (unless admin)
CREATE POLICY "update_patients" ON patients
FOR UPDATE USING (
  auth.uid() = created_by OR
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Only admins can delete (soft delete via trigger)
CREATE POLICY "delete_patients" ON patients
FOR DELETE USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Only authenticated users can insert
CREATE POLICY "insert_patients" ON patients
FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

### Inpatient Records Table

```sql
-- Doctors and Secretaries can read all inpatient records
CREATE POLICY "read_inpatient" ON inpatient_records
FOR SELECT USING (true);

-- Doctors can update, Secretaries cannot
CREATE POLICY "update_inpatient" ON inpatient_records
FOR UPDATE USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'doctor' OR
  auth.uid() = created_by
);

-- Only doctors can insert
CREATE POLICY "insert_inpatient" ON inpatient_records
FOR INSERT WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) = 'doctor'
);
```

### Outpatient Visits Table

```sql
-- All staff can read outpatient visits
CREATE POLICY "read_outpatient" ON outpatient_visits
FOR SELECT USING (true);

-- Doctors can update their own visits
CREATE POLICY "update_outpatient" ON outpatient_visits
FOR UPDATE USING (
  auth.uid() = doctor_id OR
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- Doctors and Secretaries can insert
CREATE POLICY "insert_outpatient" ON outpatient_visits
FOR INSERT WITH CHECK (
  (SELECT role FROM users WHERE id = auth.uid()) IN ('doctor', 'secretary')
);
```

### Audit Logs Table

```sql
-- Admins can read audit logs
CREATE POLICY "read_audit_logs" ON audit_logs
FOR SELECT USING (
  (SELECT role FROM users WHERE id = auth.uid()) = 'admin'
);

-- System can insert (via triggers)
CREATE POLICY "insert_audit_logs" ON audit_logs
FOR INSERT WITH CHECK (true);
```

---

## Conflict Resolution Strategy (Per Table)

### Patients Table Conflicts

```javascript
// If phone changed locally and remotely: prefer remote (secretary is authoritative)
// If name changed locally and remotely: flag for review (name is important)
// If address changed: prefer most recent (updated_at)

CONFLICT_RULES = {
  patients: {
    phone: "prefer_remote", // Secretary is authoritative
    name: "flag_for_review", // Important, needs human decision
    address: "prefer_recent", // By updated_at timestamp
    email: "prefer_local", // User's current entry
  },
};
```

### Inpatient Records Conflicts

```javascript
CONFLICT_RULES = {
  inpatient_records: {
    prov_diagnosis: "flag_for_review", // Clinical decision
    final_diagnosis: "flag_for_review", // Clinical decision
    ward: "prefer_remote", // Admin is authoritative
    date_of_discharge: "prefer_recent", // Most recent is correct
  },
};
```

### Outpatient Visits Conflicts

```javascript
CONFLICT_RULES = {
  outpatient_visits: {
    diagnosis: "flag_for_review", // Clinical decision
    treatment: "flag_for_review", // Clinical decision
    history: "prefer_recent", // Latest notes are best
  },
};
```

---

## Sync Engine Architecture

### Phase 1: Network Detection (IPC Handler)

```javascript
// electron/ipc/network.js
ipcMain.on("get-online-status", (event) => {
  event.reply("online-status", navigator.onLine);
});

// Listen for network changes
window.addEventListener("online", () => store.setState({ isOnline: true }));
window.addEventListener("offline", () => store.setState({ isOnline: false }));
```

### Phase 2: Sync Queue Management (SQLite)

```javascript
// When user creates/updates a record offline:
1. Save to local SQLite
2. Add entry to sync_queue with status='pending'
3. If online: start sync immediately
4. If offline: queue stays pending until online

// Batching (every 5 seconds or 50 items):
const pendingItems = db.sync_queue.find({ status: 'pending' }).limit(50);
POST /api/sync/batch { items: pendingItems }
```

### Phase 3: Conflict Detection & Resolution

```javascript
// On sync response:
1. Check if server version.updated_at !== local version.updated_at
2. If different:
   a. Apply CONFLICT_RULES for that field
   b. If 'flag_for_review': create sync_conflicts record
   c. If 'prefer_recent': use max(updated_at)
   d. If 'prefer_remote': use server value
3. Update local record
4. Mark sync_queue item as 'synced'

// Flag-for-review UX:
- Sync conflicts table shows conflicts
- User manually selects 'use_local' or 'use_remote'
- Sync continues after resolution
```

### Phase 4: Retry Logic with Exponential Backoff

```javascript
// Failed sync attempt
if (syncError) {
  retry_count += 1;
  wait_time = Math.min(2 ** retry_count, 300) // Max 5 mins
  last_retry_at = now() + wait_time
  status = 'failed'
}

// Retry conditions:
- Automatic retry if online and retry_count < 5
- Manual retry button if retry_count >= 5
- Alert user if sync is blocked
```

---

## IPC Communication Architecture

### Batched Database Queries (Renderer → Main)

```javascript
// Instead of individual queries, batch them:

// ❌ BAD: Multiple IPC calls
ipcRenderer.invoke("db:query", "SELECT * FROM patients WHERE id = ?", [id1]);
ipcRenderer.invoke("db:query", "SELECT * FROM patients WHERE id = ?", [id2]);
ipcRenderer.invoke("db:query", "SELECT * FROM patients WHERE id = ?", [id3]);

// ✅ GOOD: Single batched call
ipcRenderer.invoke("db:batch-query", [
  { table: "patients", query: "SELECT * WHERE id = ?", params: [id1] },
  {
    table: "inpatient_records",
    query: "SELECT * WHERE patient_id = ?",
    params: [id1],
  },
  {
    table: "outpatient_visits",
    query: "SELECT * WHERE patient_id = ?",
    params: [id1],
  },
]);
```

### IPC Handler Architecture

```javascript
// electron/ipc/database.js
ipcMain.handle("db:batch-query", async (event, queries) => {
  const results = queries.map((q) => {
    return db.prepare(q.query).all(...q.params);
  });
  return results;
});

ipcMain.handle("db:write", async (event, table, operation, data) => {
  // insert, update, or delete
  // Returns result + error handling
});
```

---

## Data Validation Layers

### Layer 1: Frontend (React Hook Form + Zod)

```javascript
const patientSchema = z.object({
  surname: z.string().min(1, "Surname required"),
  other_names: z.string().min(1, "Other names required"),
  date_of_birth: z.date(),
  gender: z.enum(["male", "female"]),
  phone: z.string().regex(/^\d{10,}$/, "Valid phone required"),
  email: z.string().email().optional(),
});
```

### Layer 2: Backend (Supabase/PostgreSQL)

```sql
-- NOT NULL constraints
ALTER TABLE patients ALTER COLUMN surname SET NOT NULL;

-- UNIQUE constraints
ALTER TABLE patients ADD CONSTRAINT unique_phone UNIQUE(phone);
ALTER TABLE patients ADD CONSTRAINT unique_patient_identity
  UNIQUE(surname, other_names, date_of_birth);

-- FOREIGN KEY constraints
ALTER TABLE inpatient_records ADD CONSTRAINT fk_patient
  FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;
```

### Layer 3: Business Logic (Service Layer)

```javascript
// services/patients.js
export async function createPatient(data) {
  // Validate with Zod
  const validated = patientSchema.parse(data);

  // Check for duplicates
  const existing = await supabase
    .from("patients")
    .select("*")
    .eq("phone", validated.phone)
    .single();

  if (existing) throw new DuplicatePatientError();

  // Insert
  return supabase.from("patients").insert([validated]);
}
```

---

## Database Indexes (Performance)

### Patients Table

```sql
-- For duplicate detection (most critical)
CREATE UNIQUE INDEX idx_patient_phone ON patients(phone) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX idx_patient_identity ON patients(surname, other_names, date_of_birth) WHERE deleted_at IS NULL;

-- For sorting/filtering
CREATE INDEX idx_patients_created_at ON patients(created_at DESC);
CREATE INDEX idx_patients_updated_at ON patients(updated_at DESC);
```

### Inpatient Records Table

```sql
CREATE INDEX idx_inpatient_patient_id ON inpatient_records(patient_id);
CREATE INDEX idx_inpatient_admission_date ON inpatient_records(date_of_admission DESC);
CREATE INDEX idx_inpatient_ward ON inpatient_records(ward);
CREATE INDEX idx_inpatient_consultant ON inpatient_records(consultant_id);
```

### Outpatient Visits Table

```sql
CREATE INDEX idx_outpatient_patient_id ON outpatient_visits(patient_id);
CREATE INDEX idx_outpatient_visit_date ON outpatient_visits(visit_date DESC);
CREATE INDEX idx_outpatient_doctor_id ON outpatient_visits(doctor_id);
```

---

## Database Migration System

### Migration Files (SQLite + PostgreSQL)

```
migrations/
├── 001_initial_schema.sql
├── 002_add_audit_logs.sql
├── 003_add_soft_deletes.sql
├── 004_add_indexes.sql
└── up.js (migration runner)
```

### Migration Runner (on app startup)

```javascript
// src/db/migrations.js
export async function runMigrations() {
  const db = getDatabase();
  const appliedMigrations = db.prepare("SELECT name FROM migrations").all();

  const files = fs
    .readdirSync("./migrations")
    .filter((f) => f.endsWith(".sql"));

  for (const file of files) {
    if (!appliedMigrations.find((m) => m.name === file)) {
      const sql = fs.readFileSync(`./migrations/${file}`, "utf8");
      db.exec(sql);
      db.prepare("INSERT INTO migrations (name) VALUES (?)").run(file);
    }
  }
}
```

### For Supabase (PostgreSQL)

```javascript
// Run migrations via Supabase dashboard or CLI:
// supabase migration up
```

---

## Pagination Strategy

### For Large Datasets

```javascript
// Don't load ALL 10,000 patients at once
// Instead:

// 1. On app startup: Load first 100 recently updated patients
SELECT * FROM patients
WHERE deleted_at IS NULL
ORDER BY updated_at DESC
LIMIT 100;

// 2. User searches: Load only search results (with limit)
SELECT * FROM patients
WHERE phone LIKE ? OR surname LIKE ?
LIMIT 50;

// 3. Infinite scroll on patient list:
const [page, setPage] = useState(0);
const ITEMS_PER_PAGE = 50;

const { data, fetchNextPage } = useInfiniteQuery({
  queryKey: ['patients'],
  queryFn: ({ pageParam = 0 }) => {
    return supabase
      .from('patients')
      .select('*')
      .range(pageParam * ITEMS_PER_PAGE, (pageParam + 1) * ITEMS_PER_PAGE);
  },
  getNextPageParam: (lastPage, pages) => pages.length,
});
```

---

## Soft Delete Strategy

### Implementation

```sql
-- All delete operations become updates:
UPDATE patients SET deleted_at = NOW() WHERE id = ?;

-- All SELECT queries include filter:
SELECT * FROM patients WHERE deleted_at IS NULL;

-- For audit purposes:
SELECT * FROM patients WHERE deleted_at IS NOT NULL; -- See deleted records
```

### In Code

```javascript
// Instead of DELETE
async function deletePatient(patientId) {
  return supabase
    .from("patients")
    .update({ deleted_at: new Date() })
    .eq("id", patientId);
}

// Queries always filter out deleted
const getPatients = () => {
  return supabase.from("patients").select("*").is("deleted_at", null);
};
```

---

## Session Management & Security

### Supabase Auth Session

```javascript
// On app start:
const {
  data: { session },
} = await supabase.auth.getSession();

if (!session) {
  // Redirect to login
  navigate("/login");
} else {
  // Check session expiry
  if (session.expires_at < Date.now() / 1000) {
    // Refresh token
    const { data } = await supabase.auth.refreshSession();
  }
}
```

### Password Encryption (Electron)

```javascript
// Save token securely:
import { safeStorage } from "electron";

ipcMain.handle("save-token", (event, token) => {
  const encrypted = safeStorage.encryptString(token);
  store.set("auth-token", encrypted); // Using electron-store
});

ipcMain.handle("get-token", (event) => {
  const encrypted = store.get("auth-token");
  return safeStorage.decryptString(encrypted);
});
```

### Session Timeout

```javascript
// Auto-logout after 30 minutes of inactivity
let inactivityTimer;

const resetInactivityTimer = () => {
  clearTimeout(inactivityTimer);
  inactivityTimer = setTimeout(
    () => {
      supabase.auth.signOut();
      navigate("/login");
    },
    30 * 60 * 1000
  );
};

// Attach to user events
window.addEventListener("mousemove", resetInactivityTimer);
window.addEventListener("keypress", resetInactivityTimer);
```

---
