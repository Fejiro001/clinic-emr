import {
  Calendar,
  CheckSquare,
  ClipboardList,
  Plus,
  Users,
} from "lucide-react";
import { Breadcrumbs } from "../components/Common";
import { useEffect, useMemo, useState } from "react";
import { DashboardCard } from "../components/Dashboard";
import { dashboardQueries, type DashboardStats } from "../services/queries";
import { showToast } from "../utils/toast";
import { Link } from "react-router";

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    currentlyAdmitted: 0,
    todayOutpatientVisits: 0,
    dischargesToday: 0,
  });

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const data = await dashboardQueries.getStats();
        setStats(data);
      } catch (error) {
        showToast.error(
          error instanceof Error
            ? error.message
            : "Failed to fetch dashboard stats."
        );
        throw error;
      }
    };

    void fetchDashboardStats();
  }, []);

  const dashboardStats = useMemo(
    () => [
      {
        title: "Total Patients",
        stat: stats.totalPatients,
        icon: <Users />,
        bg_color: "bg-accent-blue",
      },
      {
        title: "Currently Admitted",
        stat: stats.currentlyAdmitted,
        icon: <ClipboardList />,
        bg_color: "bg-accent-green",
      },
      {
        title: "Today's Outpatient Visits",
        stat: stats.todayOutpatientVisits,
        icon: <Calendar />,
        bg_color: "bg-accent-purple",
      },
      {
        title: "Discharged Today",
        stat: stats.dischargesToday,
        icon: <CheckSquare />,
        bg_color: "bg-accent-orange",
      },
    ],
    [stats]
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end gap-4">
        <Breadcrumbs>Dashboard</Breadcrumbs>

        <div className="flex items-center gap-4">
          <Link
            to={"/patients/inpatients/create-inpatient"}
            className="bg-green-600 hover:bg-green-800 add_patient_btns"
          >
            <Plus size={18} />
            Admit Patient
          </Link>

          <button className="bg-purple-600 hover:bg-purple-800 add_patient_btns">
            <Plus size={18} />
            New Outpatient
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {dashboardStats.map((card) => (
          <DashboardCard
            key={card.title}
            title={card.title}
            stat={card.stat}
            icon={card.icon}
            bg_color={card.bg_color}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
