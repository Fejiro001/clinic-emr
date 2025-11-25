import { Plus } from "lucide-react";
import { Breadcrumbs } from "../components/Common";

const Dashboard = () => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end gap-4">
        <Breadcrumbs>Dashboard</Breadcrumbs>

        <div className="flex items-center gap-4">
          <button className="bg-accent-green hover:bg-green-700 add_patient_btns">
            <Plus size={18} />
            Admit Patient
          </button>

          <button className="bg-accent-purple hover:bg-purple-700 add_patient_btns">
            <Plus size={18} />
            New Outpatient
          </button>
        </div>
      </div>

      {/* DASHBOARD CARDS */}
    </div>
  );
};

export default Dashboard;
