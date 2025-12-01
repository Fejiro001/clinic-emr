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
  email: z.email("Valid email required").optional().or(z.literal("")),
  address: z.string().optional(),
  civil_state: z.string().optional(),
  occupation: z.string().optional(),
  place_of_work: z.string().optional(),
  tribe_nationality: z.string().optional(),
  next_of_kin: z.string().optional(),
  relationship_to_patient: z.string().optional(),
  address_next_of_kin: z.string().optional(),
});
