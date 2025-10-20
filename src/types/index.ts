export interface User {
  id: string;
  email: string;
  role: "doctor" | "secretary" | "nurse" | "admin";
}

export interface Patient {
  id: string;
  surname: string;
  other_names: string;
  date_of_birth: string;
  phone: string;
  email?: string;
}
