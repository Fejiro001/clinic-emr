import { create } from "zustand";
import type { InpatientRecord } from "../types/supabase";

interface InPatientState {
  inpatientRecords: InpatientRecord[] | [];
  setInpatientRecords: (inpatient: InpatientRecord[] | []) => void;
}

export const useInpatientStore = create<InPatientState>((set) => ({
  inpatientRecords: [],

  setInpatientRecords: (inpatient) => {
    set({ inpatientRecords: inpatient });
  },
}));
