import { Loader2, Search, X } from "lucide-react";
import { Button } from "../Common";
import type { Patient } from "../../types/supabase";

interface PatientSearchProps {
  searchPhone: string;
  setSearchPhone: (target: string) => void;
  searching: boolean;
  useExisting: boolean;
  existingPatient: Patient | null;
  handleClearSearch: () => void;
  handleSearchPatient: () => void;
}

const PatientSearch = ({
  searchPhone,
  setSearchPhone,
  searching,
  useExisting,
  existingPatient,
  handleClearSearch,
  handleSearchPatient,
}: PatientSearchProps) => {
  return (
    <div className="rounded-md shadow-sm border border-gray-300 py-4 px-6 mb-4">
      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-2">
        <Search size={18} />
        Search For Existing Patient
      </h2>
      <div className="flex gap-3">
        <div className="flex-1">
          <input
            type="tel"
            className="w-full input_style"
            value={searchPhone}
            onChange={(e) => {
              setSearchPhone(e.target.value);
            }}
            placeholder="Enter phone number to search"
            disabled={useExisting}
          />
        </div>

        <Button
          type="button"
          onClick={handleSearchPatient}
          disabled={searching || useExisting}
          variant="primary"
          className="flex items-center gap-2"
        >
          {searching ? (
            <Loader2 className="animate-spin" size={16} />
          ) : (
            <Search size={16} />
          )}
          Search
        </Button>

        {useExisting && (
          <Button
            type="button"
            onClick={handleClearSearch}
            variant="secondary"
            className="flex items-center gap-2"
          >
            <X size={16} />
            Clear
          </Button>
        )}
      </div>

      {existingPatient && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-800 font-medium">
            ✓ Patient Found: {existingPatient.surname}{" "}
            {existingPatient.other_names}
          </p>
          <p className="text-green-700 text-sm mt-1">
            Phone: {existingPatient.phone}
          </p>
        </div>
      )}
    </div>
  );
};

export default PatientSearch;
