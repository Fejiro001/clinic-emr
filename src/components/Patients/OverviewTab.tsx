import { Activity, Stethoscope } from "lucide-react";
import type {
  InpatientRecord,
  OutpatientVisit,
  Patient,
} from "../../types/supabase";

const OverviewTab = ({
  patient,
  inpatientCount,
  outpatientCount,
  operationCount,
  recentActivity,
}: {
  patient: Patient;
  inpatientCount: number;
  outpatientCount: number;
  operationCount: number;
  recentActivity: (InpatientRecord | OutpatientVisit)[];
}) => {
  const quickStats = [
    {
      count: outpatientCount,
      title: "Outpatient Visits",
      bgColor: "from-primary-500 to-primary-600",
    },
    {
      count: inpatientCount,
      title: "Admissions",
      bgColor: "from-orange-500 to-orange-600",
    },
    {
      count: operationCount,
      title: "Operations",
      bgColor: "from-green-500 to-green-600",
    },
  ];

  const information = [
    {
      label: "Date of Birth:",
      value: new Date(patient.date_of_birth).toLocaleDateString(),
    },
    {
      label: "Gender:",
      value: patient.gender,
    },
    {
      label: "Civil State:",
      value: patient.civil_state ?? "N/A",
    },
    {
      label: "Occupation:",
      value: patient.occupation ?? "N/A",
    },
    {
      label: "Tribe/Nationality:",
      value: patient.tribe_nationality ?? "N/A",
    },
    {
      label: "Religion:",
      value: patient.religion ?? "N/A",
    },
    {
      label: "Next of Kin:",
      value: patient.next_of_kin ?? "N/A",
    },
    {
      label: "Relationship:",
      value: patient.relationship_to_patient ?? "N/A",
    },
    {
      label: "Address:",
      value: patient.address_next_of_kin ?? "N/A",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {quickStats.map((stats) => (
          <div
            key={stats.title}
            className={`${stats.bgColor} bg-gradient-to-br text-white rounded-md p-4`}
          >
            <div className="text-3xl font-bold">{stats.count}</div>
            <div className="text-sm">{stats.title}</div>
          </div>
        ))}
      </div>

      {/* Patient Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="overview_tab_sections">
          <h3 className="tab_sections_titles">Personal Information</h3>
          <dl className="space-y-3 text-sm">
            {information.slice(0, 6).map((info) => (
              <div className="flex justify-between">
                <dt className="text-gray-600">{info.label}</dt>
                <dd className="font-medium text-gray-900">{info.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* Emergency Contact */}
        <div className="overview_tab_sections">
          <h3 className="tab_sections_titles">Emergency Contact</h3>
          <dl className="space-y-3 text-sm">
            {information.slice(6).map((info) => (
              <div className="flex justify-between">
                <dt className="text-gray-600">{info.label}</dt>
                <dd className="font-medium text-gray-900">{info.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="overview_tab_sections">
        <h3 className="tab_sections_titles">Recent Activity</h3>
        {recentActivity.length === 0 ? (
          <p className="text-gray-500 text-sm">No recent activity</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.slice(0, 5).map((activity) => {
              const isInpatient = "ward" in activity;
              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div
                    className={`p-2 rounded-full ${isInpatient ? "bg-yellow-100" : "bg-blue-100"}`}
                  >
                    {isInpatient ? (
                      <Activity size={16} className="text-yellow-600" />
                    ) : (
                      <Stethoscope size={16} className="text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">
                      {isInpatient ? "Admission" : "Outpatient Visit"}
                    </div>
                    <div className="text-xs text-gray-600">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OverviewTab;
