import { create } from "zustand";
import type { Patient } from "../types/supabase";

interface PatientState {
  isLoading: boolean;
  error: string;
  patients: Patient[] | [];
  patient: Patient | null;

  setPatients: (patients: Patient[]) => void;
  setPatient: (patient: Patient | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
}

export const usePatientStore = create<PatientState>((set) => ({
  isLoading: false,
  error: "",
  patients: [],
  patient: null,

  setPatients: (patients) => {
    set({
      patients,
    });
  },

  setPatient: (patient) => {
    set({ patient });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },
}));
