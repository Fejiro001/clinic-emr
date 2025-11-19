import { useEffect } from "react";
import { Breadcrumbs } from "../../components/Common";
import { usePatientStore } from "../../store/patientStore";
import { patientsService } from "../../services/patients";

const PatientsPage = () => {
  const { isLoading, error, patients } = usePatientStore();

  useEffect(() => {
    void patientsService.fetchAllPatients();
  }, []);

  if (isLoading) {
    return (
      <section>
        <Breadcrumbs>Patient Registry</Breadcrumbs>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading patients...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section>
        <Breadcrumbs>Patient Registry</Breadcrumbs>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </section>
    );
  }

  return (
    <section>
      <Breadcrumbs>Patient Registry</Breadcrumbs>

      {/* SearchBar */}
      <div className="my-4">
        <input
          type="text"
          placeholder="Search patients..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Patients Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Total Patients: {patients.length}
        </p>
      </div>

      {/* Table */}
      {patients.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No patients found</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Surname
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Other Names
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date of Birth
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {patient.surname}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {patient.other_names}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {patient.phone || "N/A"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 capitalize">
                    {patient.gender}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(patient.date_of_birth).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <button
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50"
          disabled
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">Page 1</span>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Next
        </button>
      </div>
    </section>
  );
};

export default PatientsPage;
