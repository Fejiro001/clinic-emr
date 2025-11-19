import { create } from "zustand";
import type { Patient } from "../types/supabase";

interface PatientState {
  isLoading: boolean;
  error: string;
  patients: Patient[] | [];
  setPatients: (patients: Patient[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
}

export const usePatientStore = create<PatientState>((set) => ({
  isLoading: false,
  error: "",
  patients: [],

  setPatients: (patients) => {
    set({
      patients,
    });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },
}));
