export type UserRole = "doctor" | "secretary" | "nurse" | "admin";

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
