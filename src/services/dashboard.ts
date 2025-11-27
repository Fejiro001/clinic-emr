import { showToast } from "../utils/toast";
import { dashboardQueries, type DashboardStats } from "./queries";

export class DashboardService {
  async fetchDashboardStats(): Promise<DashboardStats> {
    try {
      const stats = await dashboardQueries.getStats();
      return stats;
    } catch (error) {
      showToast.error(
        error instanceof Error
          ? error.message
          : "Failed to fetch dashboard stats."
      );
      throw error;
    }
  }
}

export const dashboardService = new DashboardService();
