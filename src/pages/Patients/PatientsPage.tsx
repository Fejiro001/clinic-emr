import { useEffect, useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import type { Patient } from "../../types/supabase";
import { useCustomTable, usePagination } from "../../hooks";
import { patientsService } from "../../services/patients";
import { Breadcrumbs } from "../../components/Common";
import { MainTable, Pagination } from "../../components/TableComponents";
import { patientQueries } from "../../services/queries";
import { Eye, Pencil, Trash2 } from "lucide-react";

const PatientsPage = () => {
  const {
    data: patients,
    loading,
    error,
    pagination,
    nextPage,
    prevPage,
    goToPage,
    firstPage,
    lastPage,
  } = usePagination({
    fetchFn: patientQueries.getAll,
    countFn: patientQueries.getCount,
    initialLimit: 20,
    initialPage: 1,
  });

  useEffect(() => {
    void patientsService.fetchAllPatients();
  }, []);

  const columns = useMemo<ColumnDef<Patient>[]>(
    () => [
      {
        accessorKey: "surname",
        header: "Surname",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "other_names",
        header: "Other Names",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "phone",
        header: "Phone Number",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "gender",
        header: "Gender",
        cell: (info) => info.getValue(),
      },
      {
        accessorKey: "date_of_birth",
        header: "Age",
        cell: (info) => {
          const dob = new Date(info.getValue() as string);
          const ageDifMs = Date.now() - dob.getTime();
          const ageDate = new Date(ageDifMs);
          return <span>{Math.abs(ageDate.getUTCFullYear() - 1970)}</span>;
        },
      },
      {
        header: "Actions",
        cell: (info) => {
          const patient = info.row.original;
          return (
            <div className="flex gap-2">
              <button title="View" className="text-primary-600">
                <Eye size={16} />
              </button>
              <button title="Edit" className="text-gray-600">
                <Pencil size={16} />
              </button>
              <button title="Delete" className="text-red-600">
                <Trash2 size={16} />
              </button>
            </div>
          );
        },
      },
    ],
    []
  );

  const { table, globalFilter } = useCustomTable(patients, columns);

  if (loading) {
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
          onChange={(e) => {
            table.setGlobalFilter(e.target.value);
          }}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-md"
        />
      </div>

      {/* Patients Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Total Patients: {pagination.total}
        </p>
      </div>

      {/* Table */}
      {patients.length === 0 ? (
        <div className="text-center text-gray-500 py-8">No patients found</div>
      ) : (
        <div className="overflow-x-auto">
          <MainTable table={table} />
        </div>
      )}

      {/* Pagination */}
      <Pagination
        pagination={pagination}
        onNextPage={nextPage}
        onPrevPage={prevPage}
        onGoToPage={goToPage}
        onFirstPage={firstPage}
        onLastPage={lastPage}
        entriesName="patients"
      />
    </section>
  );
};

export default PatientsPage;
