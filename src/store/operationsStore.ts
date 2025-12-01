import { create } from "zustand";
import type { Operation } from "../types/supabase";

interface OperationsState {
  operations: Operation[] | [];
  setOperations: (operations: Operation[] | []) => void;
}

export const useOperationsStore = create<OperationsState>((set) => ({
  operations: [],

  setOperations: (operations) => {
    set({ operations });
  },
}));