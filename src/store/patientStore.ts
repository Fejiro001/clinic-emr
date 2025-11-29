import { create } from "zustand";
import type { Patient } from "../types/supabase";

interface PatientState {
  isLoading: boolean;
  error: string;
  patients: Patient[] | [];
  selectedPatient: Patient | null;

  setPatients: (patients: Patient[]) => void;
  setSelectedPatient: (patient: Patient | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string) => void;
}

export const usePatientStore = create<PatientState>((set) => ({
  isLoading: false,
  error: "",
  patients: [],
  selectedPatient: null,

  setPatients: (patients) => {
    set({
      patients,
    });
  },

  setSelectedPatient: (patient) => {
    set({ selectedPatient: patient });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  setError: (error) => {
    set({ error });
  },
}));
