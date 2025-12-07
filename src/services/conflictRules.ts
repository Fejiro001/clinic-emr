import type { ConflictStrategy } from "../types";

// Map of table names to their conflict resolution strategies
type TableConflictRules = Record<string, ConflictStrategy>;

export const CONFLICT_RULES: Record<string, TableConflictRules> = {
  patients: {
    surname: "flag_for_review",
    other_names: "flag_for_review",
    phone: "prefer_remote",
    email: "prefer_local",
    address: "prefer_recent",
    date_of_birth: "flag_for_review",
    gender: "flag_for_review",
    civil_state: "prefer_recent",
    occupation: "prefer_recent",
    place_of_work: "prefer_recent",
    tribe_nationality: "prefer_recent",
    religion: "prefer_recent",
    next_of_kin: "prefer_recent",
    relationship_to_patient: "prefer_recent",
    address_next_of_kin: "prefer_recent",
  },
  inpatient_records: {
    unit_number: "prefer_remote",
    ward: "prefer_remote",
    consultant_id: "prefer_remote",
    code_no: "prefer_remote",
    prov_diagnosis: "flag_for_review",
    final_diagnosis: "flag_for_review",
    date_of_discharge: "prefer_recent",
  },
  outpatient_visits: {
    history: "prefer_recent",
    diagnosis: "flag_for_review",
    treatment: "flag_for_review",
    notes: "prefer_recent",
  },
  operations: {
    operation_name: "flag_for_review",
    operation_date: "prefer_recent",
    doctor_id: "prefer_remote",
    notes: "prefer_recent",
  },
};
