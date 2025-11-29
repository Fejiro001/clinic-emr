import { useEffect, useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import type { Patient } from "../../types/supabase";
import { useCustomTable, useDebounce, usePagination } from "../../hooks";
import { patientsService } from "../../services/patients";
import { Breadcrumbs, Button } from "../../components/Common";
import {
  MainTable,
  Pagination,
  SkeletonTable,
} from "../../components/TableComponents";
import { patientQueries } from "../../services/queries";
import { useNavigate } from "react-router";

const Patients = () => {
  const [searchInput, setSearchInput] = useState("");
  const { debouncedValue: search } = useDebounce(searchInput);
  const [genderFilter, setGenderFilter] = useState<string>();

  const navigate = useNavigate();
  const isSearching = searchInput !== search && searchInput !== "";

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
    gender: genderFilter,
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

  useEffect(() => {
    if (search) goToPage(1);
  }, [goToPage, search]);

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
    <section className="space-y-4">
      <Breadcrumbs>Patient Registry</Breadcrumbs>

      <div className="flex gap-4">
        {/* SearchBar */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search patients..."
            onChange={(event) => {
              setSearchInput(event.target.value);
            }}
            value={searchInput}
            className="w-full input_style"
          />
          {isSearching ? (
            <div className="absolute right-3 top-3">
              <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
            </div>
          ) : (
            searchInput && (
              <button
                onClick={() => {
                  setSearchInput("");
                }}
                title="Clear search"
                className="absolute right-3 top-2 bg-gray-500 hover:bg-gray-700 text-white px-2 py-1 rounded-full text-sm font-bold cursor-pointer "
              >
                ✕
              </button>
            )
          )}
        </div>

        {/* Gender Filter */}
        <select
          className="input_style"
          value={genderFilter}
          onChange={(e) => {
            setGenderFilter(e.target.value || undefined);
          }}
        >
          <option value="">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      {/* Patients Count */}
      <div>
        <p className="text-sm text-gray-600">
          Total Patients: {pagination.total}
        </p>
      </div>

      {/* Table */}
      {patients.length === 0 && (
        <div className="text-center text-gray-500 py-8">No patients found</div>
      )}

      {patients.length !== 0 &&
        (loading ? (
          <SkeletonTable table={table} message="Loading patients..." />
        ) : (
          <MainTable table={table} />
        ))}

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
