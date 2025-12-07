import { create } from "zustand";
import type { Users } from "../types/supabase";

interface UsersState {
  users: Users[] | [];
  error: string;

  setUsers: (outpatient: Users[] | []) => void;
  setError: (error: string) => void;
}

export const useUsersStore = create<UsersState>((set) => ({
  users: [],
  error: "",

  setUsers: (users) => {
    set({ users });
  },

  setError: (error) => {
    set({ error });
  },
}));
