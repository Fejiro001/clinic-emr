import type { FieldConfig } from "../components/Form/EditableField";
import type { InpatientAdmissionForm } from "../pages/Inpatients/CreateInpatient";

export const admissionForm: FieldConfig<InpatientAdmissionForm>[] = [
  {
    inputType: "input",
    required: true,
    label: "Unit Number",
    inputId: "unit_number",
    placeholder: "Unit number",
  },
  {
    inputType: "dropdown",
    required: true,
    label: "Ward",
    inputId: "ward",
    placeholder: "Ward",
    options: ["female ward", "male ward", "private ward"],
  },
  {
    inputType: "input",
    required: true,
    label: "Date of Admission",
    inputId: "date_of_admission",
    placeholder: "",
    type: "date",
  },
  {
    inputType: "input",
    required: false,
    label: "Code Number",
    inputId: "code_no",
    placeholder: "Code number (optional)",
  },
  {
    inputType: "textarea",
    required: true,
    label: "Provisional Diagnosis",
    inputId: "prov_diagnosis",
    placeholder: "Enter provisional diagnosis",
  },
];
