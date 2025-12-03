type InputIds =
  | "civil_state"
  | "occupation"
  | "place_of_work"
  | "tribe_nationality"
  | "next_of_kin"
  | "relationship_to_patient"
  | "address_next_of_kin"
  | "surname"
  | "other_names"
  | "phone"
  | "email"
  | "address";

export const patientDetails: {
  label: string;
  type: string;
  inputId: InputIds;
  placeholder: string;
}[] = [
  {
    label: "Civil State",
    type: "text",
    inputId: "civil_state",
    placeholder: "e.g., Single, Married",
  },
  {
    label: "Occupation",
    type: "text",
    inputId: "occupation",
    placeholder: "Patient occupation",
  },
  {
    label: "Place of Work",
    type: "text",
    inputId: "place_of_work",
    placeholder: "Workplace",
  },
  {
    label: "Tribe/Nationality",
    type: "text",
    inputId: "tribe_nationality",
    placeholder: "Tribe or nationality",
  },
  {
    label: "Next of Kin",
    type: "text",
    inputId: "next_of_kin",
    placeholder: "Emergency contact name",
  },
  {
    label: "Relationship to Patient",
    type: "text",
    inputId: "relationship_to_patient",
    placeholder: "e.g., Spouse, Parent, Sibling",
  },
];
