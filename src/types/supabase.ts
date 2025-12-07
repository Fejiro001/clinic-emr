export interface Patient {
  id: string;
  surname: string;
  other_names: string;
  date_of_birth: string;
  gender: "male" | "female";
  address?: string;
  civil_state?: string;
  phone: string;
  email?: string;
  occupation?: string;
  place_of_work?: string;
  tribe_nationality?: string;
  religion?: string;
  next_of_kin?: string;
  relationship_to_patient?: string;
  address_next_of_kin?: string;
  unit_number: string;
  created_by: string;
  updated_by: string;
  version: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  synced_at?: string;
}

export interface InpatientRecord {
  id: string;
  patient_id: string;
  related_outpatient_visit_id?: string;
  unit_number?: string;
  ward: string;
  consultant_id?: string;
  code_no?: string;
  prov_diagnosis: string;
  final_diagnosis?: string;
  date_of_admission: string;
  date_of_discharge?: string;
  created_by?: string;
  updated_by?: string;
  version: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  synced_at?: string;
}

export interface Operation {
  id: string;
  inpatient_record_id: string;
  operation_name: string;
  operation_date: string;
  doctor_id?: string;
  notes?: string;
  created_by: string;
  updated_by: string;
  version: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  synced_at?: string;
}

export interface OutpatientVisit {
  id: string;
  patient_id: string;
  visit_date: string;
  visit_time: string;
  history: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  doctor_id: string;
  clinic_id?: string;
  created_by: string;
  updated_by: string;
  version: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  synced_at?: string;
}

export type InsertPatient = Omit<
  Patient,
  | "version"
  | "created_at"
  | "updated_at"
  | "deleted_at"
  | "synced_at"
  | "updated_by"
  | "created_by"
>;

export type UpdatePatient = Partial<{
  surname: string;
  other_names: string;
  date_of_birth: string;
  gender: "male" | "female";
  address: string;
  civil_state: string;
  phone: string;
  email: string;
  occupation: string;
  place_of_work: string;
  tribe_nationality: string;
  religion: string;
  next_of_kin: string;
  relationship_to_patient: string;
  address_next_of_kin: string;
  updated_by: string;
  version: number;
}>;

export interface Users {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  updated_at: string;
}
