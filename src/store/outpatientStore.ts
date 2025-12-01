import { create } from "zustand";
import type { OutpatientVisit } from "../types/supabase";

interface OutpatientVisitState {
  outpatientVisits: OutpatientVisit[] | [];
  setOutpatientVisits: (outpatient: OutpatientVisit[] | []) => void;
}

export const useOutpatientStore = create<OutpatientVisitState>((set) => ({
  outpatientVisits: [],

  setOutpatientVisits: (outpatient) => {
    set({ outpatientVisits: outpatient });
  },
}));
