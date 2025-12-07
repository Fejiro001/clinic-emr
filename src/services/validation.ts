import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email({
      error: (issue) =>
        issue.input === ""
          ? "This field is required"
          : "Enter a valid email address",
    })
    .trim(),
  password: z.string().min(8, "Password must be at least 8 characters").trim(),
});

export const patientEditSchema = z.object({
  surname: z.string().min(1, "Surname is required"),
  other_names: z.string().min(1, "Other names are required"),
  phone: z.string().min(10, "Valid phone number required"),
  gender: z.enum(["male", "female"]),
  date_of_birth: z.string(),
  email: z.email("Valid email required").optional().or(z.literal("")),
  address: z.string().optional(),
  civil_state: z.string().optional(),
  occupation: z.string().optional(),
  place_of_work: z.string().optional(),
  religion: z.string().optional(),
  tribe_nationality: z.string().optional(),
  next_of_kin: z.string().optional(),
  relationship_to_patient: z.string().optional(),
  address_next_of_kin: z.string().optional(),
});

export const inpatientAdmissionSchema = z.object({
  surname: z.string().min(1, "Surname is required"),
  other_names: z.string().min(1, "Other names are required"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female"]),
  phone: z.string().min(10, "Valid phone number required"),
  email: z.email("Valid email").optional().or(z.literal("")),
  address: z.string(),
  civil_state: z.string().optional(),
  occupation: z.string().optional(),
  place_of_work: z.string().optional(),
  religion: z.string().optional(),
  tribe_nationality: z.string().optional(),
  next_of_kin: z.string().optional(),
  relationship_to_patient: z.string().optional(),
  address_next_of_kin: z.string().optional(),

  // Admission Info
  unit_number: z.string().min(1, "Unit number is required"),
  ward: z.string().min(1, "Ward is required"),
  consultant_id: z.string().optional(),
  code_no: z.string().optional(),
  prov_diagnosis: z.string().min(1, "Provisional diagnosis is required"),
  date_of_admission: z.string().min(1, "Admission date is required"),
});