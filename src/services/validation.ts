import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .email({
      error: (issue) =>
        issue.input === ""
          ? "Email is required"
          : "Enter a valid email address",
    })
    .trim(),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .trim(),
});

export const patientEditSchema = z.object({
  surname: z.string().min(1, "Surname is required").trim(),
  other_names: z.string().min(1, "Other names are required").trim(),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .min(10, "Phone number must be at least 10 digits")
    .trim(),
  gender: z.enum(["male", "female"], {
    message: "Please select a gender",
  }),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  email: z.email("Valid email required").optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  civil_state: z.string().optional().or(z.literal("")),
  occupation: z.string().optional().or(z.literal("")),
  place_of_work: z.string().optional().or(z.literal("")),
  religion: z.string().optional().or(z.literal("")),
  tribe_nationality: z.string().optional().or(z.literal("")),
  next_of_kin: z.string().optional().or(z.literal("")),
  relationship_to_patient: z.string().optional().or(z.literal("")),
  address_next_of_kin: z.string().optional().or(z.literal("")),
});

export const inpatientAdmissionSchema = z.object({
  surname: z.string().min(1, "Surname is required").trim(),
  other_names: z.string().min(1, "Other names are required").trim(),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .min(10, "Phone number must be at least 10 digits")
    .trim(),
  gender: z.enum(["male", "female"], {
    message: "Please select a gender",
  }),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  email: z.email("Valid email required").optional().or(z.literal("")),
  address: z.string().min(1, "Home address is required"),
  civil_state: z.string().optional().or(z.literal("")),
  occupation: z.string().optional().or(z.literal("")),
  place_of_work: z.string().optional().or(z.literal("")),
  religion: z.string().optional().or(z.literal("")),
  tribe_nationality: z.string().optional().or(z.literal("")),
  next_of_kin: z.string().min(1, "Next of Kin is required"),
  relationship_to_patient: z.string().min(1, "Relationship to next of kin is required"),
  address_next_of_kin: z.string().min(1, "Address of next of kin is required"),

  // Admission Info
  unit_number: z.string().min(1, "Unit number is required").trim(),
  ward: z.string().min(1, "Ward is required").trim(),
  prov_diagnosis: z.string().min(1, "Provisional diagnosis is required").trim(),
  date_of_admission: z.string().min(1, "Admission date is required"),

  consultant_id: z.string().optional().or(z.literal("")),
  code_no: z.string().optional().or(z.literal("")),
});

// Outpatient visit schema
export const outpatientVisitSchema = z.object({
  surname: z.string().min(1, "Surname is required").trim(),
  other_names: z.string().min(1, "Other names are required").trim(),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(["male", "female"], {
    message: "Please select a gender",
  }),
  phone: z
    .string()
    .min(1, "Phone number is required")
    .min(10, "Phone number must be at least 10 digits")
    .trim(),

  // Patient Information (optional)
  email: z
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
  address: z.string().optional().or(z.literal("")),

  // Visit Information (required)
  visit_date: z.string().min(1, "Visit date is required"),
  visit_time: z.string().min(1, "Visit time is required"),
  history: z.string().min(1, "Patient history is required").trim(),
  diagnosis: z.string().min(1, "Diagnosis is required").trim(),
  treatment: z.string().min(1, "Treatment is required").trim(),
  doctor_id: z.string().min(1, "Doctor is required"),

  // Visit Information (optional)
  notes: z.string().optional().or(z.literal("")),
  unit_number: z.string().optional().or(z.literal("")),
});

// Discharge schema
export const dischargeSchema = z.object({
  final_diagnosis: z.string().min(1, "Final diagnosis is required").trim(),
  date_of_discharge: z.string().min(1, "Discharge date is required"),
});

// Operation schema
export const operationSchema = z.object({
  operation_name: z.string().min(1, "Operation name is required").trim(),
  operation_date: z.string().min(1, "Operation date is required"),
  doctor_id: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});
