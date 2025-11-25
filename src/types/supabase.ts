export interface Patient {
  id: string;
  surname: string;
  other_names: string;
  date_of_birth: string;
  gender: string;
  address?: string;
  civil_state?: string;
  phone: string;
  email?: string;
  occupation?: string;
  place_of_work?: string;
  tribe_nationality?: string;
  next_of_kin?: string;
  relationship_to_patient?: string;
  address_next_of_kin?: string;
  unit_number?: string;
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
  next_of_kin: string;
  relationship_to_patient: string;
  address_next_of_kin: string;
  updated_by: string;
  version: number;
}>;
