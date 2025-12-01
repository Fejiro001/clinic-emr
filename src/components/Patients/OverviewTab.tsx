import { Activity, Stethoscope } from "lucide-react";
import type { InpatientRecord, OutpatientVisit, Patient } from "../../types/supabase";

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
  const calculateAge = (dob: string) => {
    const age = new Date().getFullYear() - new Date(dob).getFullYear();
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg p-4">
          <div className="text-3xl font-bold">{outpatientCount}</div>
          <div className="text-blue-100 text-sm">Outpatient Visits</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg p-4">
          <div className="text-3xl font-bold">{inpatientCount}</div>
          <div className="text-yellow-100 text-sm">Admissions</div>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-lg p-4">
          <div className="text-3xl font-bold">{operationCount}</div>
          <div className="text-red-100 text-sm">Operations</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg p-4">
          <div className="text-3xl font-bold">
            {calculateAge(patient.date_of_birth)}
          </div>
          <div className="text-green-100 text-sm">Years Old</div>
        </div>
      </div>

      {/* Patient Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Personal Information
          </h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Date of Birth:</dt>
              <dd className="font-medium text-gray-900">
                {new Date(patient.date_of_birth).toLocaleDateString()}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Gender:</dt>
              <dd className="font-medium text-gray-900 capitalize">
                {patient.gender}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Civil State:</dt>
              <dd className="font-medium text-gray-900">
                {patient.civil_state ?? "N/A"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Occupation:</dt>
              <dd className="font-medium text-gray-900">
                {patient.occupation ?? "N/A"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Tribe/Nationality:</dt>
              <dd className="font-medium text-gray-900">
                {patient.tribe_nationality ?? "N/A"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">
            Emergency Contact
          </h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Next of Kin:</dt>
              <dd className="font-medium text-gray-900">
                {patient.next_of_kin ?? "N/A"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Relationship:</dt>
              <dd className="font-medium text-gray-900">
                {patient.relationship_to_patient ?? "N/A"}
              </dd>
            </div>
            <div>
              <dt className="text-gray-600 mb-1">Address:</dt>
              <dd className="font-medium text-gray-900">
                {patient.address_next_of_kin ?? "N/A"}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Recent Activity
        </h3>
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