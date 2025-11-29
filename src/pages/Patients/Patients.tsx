import { useEffect, useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import type { Patient } from "../../types/supabase";
import { useCustomTable, useDebounce, usePagination } from "../../hooks";
import { patientsService } from "../../services/patients";
import { Breadcrumbs, Button } from "../../components/Common";
import { MainTable, Pagination } from "../../components/TableComponents";
import { patientQueries } from "../../services/queries";
import { useNavigate } from "react-router";

const Patients = () => {
  const [searchInput, setSearchInput] = useState("");
  const { debouncedValue: search } = useDebounce(searchInput);
  const navigate = useNavigate();

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
    queryFn: patientQueries.query,
    countFn: patientQueries.count,
    search,
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
            <Button
              onClick={() => {
                console.log("Navigating to details of patient ID:", patient.id);
                void navigate("/patients/details", {
                  state: { patientId: patient.id },
                });
              }}
              size="sm"
            >
              Details
            </Button>
          );
        },
      },
    ],
    [navigate]
  );

  const { table } = useCustomTable(patients, columns);

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
          onChange={(event) => {
            setSearchInput(event.target.value);
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
        <MainTable table={table} />
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

export default Patients;
