import { useUsersStore } from "../store/usersStore";
import { userQueries } from "./queries";

export class UsersService {
  async fetchAllDoctors() {
    try {
      const users = await userQueries.getAllDoctors();
      useUsersStore.getState().setUsers(users);
      return users;
    } catch (error) {
      useUsersStore
        .getState()
        .setError(
          error instanceof Error ? error.message : "Failed to fetch patients"
        );
      throw error;
    }
  }
}

export const usersService = new UsersService();
