import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { usePatientStore } from "../../store/patientStore";
import { patientsService } from "../../services/patients";
import { Breadcrumbs } from "../../components/Common";
import {
  InpatientTab,
  OperationsTab,
  OutpatientTab,
  OverviewTab,
  PatientHeader,
  PatientTimeline,
} from "../../components/Patients";
import { useInpatientStore } from "../../store/inpatientStore";
import { useOutpatientStore } from "../../store/outpatientStore";
import {
  Activity,
  FileText,
  Hospital,
  Loader2,
  Stethoscope,
} from "lucide-react";
import { useOperationsStore } from "../../store/operationsStore";

interface LocationState {
  id?: string;
}

type TabType =
  | "overview"
  | "timeline"
  | "inpatient"
  | "outpatient"
  | "operations";

const PatientDetails = () => {
  const location = useLocation();
  const patientId = (location.state as LocationState).id ?? "";
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const { patient, setPatient, isLoading, error } = usePatientStore();
  const { inpatientRecords } = useInpatientStore();
  const { outpatientVisits } = useOutpatientStore();
  const { operations } = useOperationsStore();

  const isCurrentlyAdmitted = inpatientRecords.some(
    (record) => !record.date_of_discharge
  );

  useEffect(() => {
    if (!patientId) {
      void navigate("/patients");
      return;
    }

    void patientsService.fetchPatientById(patientId);
  }, [patientId, navigate]);

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex items-center gap-2 text-gray-500">
          <Loader2 className="animate-spin" size={24} />
          <span>Loading patient data...</span>
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-red-600 text-lg font-semibold mb-2">Error</div>
        <div className="text-gray-600 mb-4">{error}</div>
        <button
          onClick={() => void navigate("/patients")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Patients
        </button>
      </div>
    );
  }

  // Handle no patient found
  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="text-gray-600 text-lg mb-4">Patient not found</div>
        <button
          onClick={() => void navigate("/patients")}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Back to Patients
        </button>
      </div>
    );
  }

  const tabs: {
    id: TabType;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    { id: "overview", label: "Overview", icon: <FileText size={18} /> },
    {
      id: "timeline",
      label: "Timeline",
      icon: <Activity size={18} />,
      count:
        inpatientRecords.length + outpatientVisits.length + operations.length,
    },
    {
      id: "inpatient",
      label: "Inpatient",
      icon: <Hospital size={18} />,
      count: inpatientRecords.length,
    },
    {
      id: "outpatient",
      label: "Outpatient",
      icon: <Stethoscope size={18} />,
      count: outpatientVisits.length,
    },
  ];

  return (
    <section className="space-y-4">
      <Breadcrumbs>Patient Details</Breadcrumbs>

      <PatientHeader
        patient={patient}
        onUpdate={setPatient}
        isCurrentlyAdmitted={isCurrentlyAdmitted}
      />

      {/* Tabs */}
      <div className="rounded-md shadow-md shadow-dark-surface border border-gray-300">
        <div className="border-b border-gray-300">
          <div className="flex gap-1 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                }}
                className={`tabs ${
                  activeTab === tab.id
                    ? "bg-primary-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {tab.icon}
                <div className="space-x-2">
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${
                        activeTab === tab.id
                          ? "bg-primary-900 text-white"
                          : "bg-gray-300 text-gray-800"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "overview" && (
            <OverviewTab
              patient={patient}
              inpatientCount={inpatientRecords.length}
              outpatientCount={outpatientVisits.length}
              operationCount={operations.length}
              recentActivity={[
                ...inpatientRecords.slice(0, 3),
                ...outpatientVisits.slice(0, 3),
              ].sort(
                (a, b) =>
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
              )}
            />
          )}

          {activeTab === "timeline" && (
            <PatientTimeline
              patientId={patient.id}
              inpatientRecords={inpatientRecords}
              outpatientVisits={outpatientVisits}
              operations={operations}
            />
          )}

          {activeTab === "inpatient" && (
            <InpatientTab records={inpatientRecords} operations={operations} />
          )}

          {activeTab === "outpatient" && (
            <OutpatientTab visits={outpatientVisits} />
          )}

          {activeTab === "operations" && (
            <OperationsTab
              operations={operations}
              inpatientRecords={inpatientRecords}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default PatientDetails;
