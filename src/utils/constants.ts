export const ROLES = {
  DOCTOR: "doctor",
  SECRETARY: "secretary",
  NURSE: "nurse",
  ADMIN: "admin",
} as const;

export const USER_ROLES = [
  { value: "doctor", label: "Doctor" },
  { value: "secretary", label: "Secretary" },
  { value: "nurse", label: "Nurse" },
  { value: "admin", label: "Admin" },
] as const;
