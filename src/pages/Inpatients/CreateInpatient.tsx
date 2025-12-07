import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router";
import { nanoid } from "nanoid";
import { UserPlus, Loader2, X } from "lucide-react";
import { Breadcrumbs, Button } from "../../components/Common";
import { patientQueries, inpatientQueries } from "../../services/queries";
import { showToast } from "../../utils/toast";
import type { Patient } from "../../types/supabase";
import { inpatientAdmissionSchema } from "../../services/validation";
import { PatientForm, PatientSearch } from "../../components/Patients";
import { AdmissionForm } from "../../components/Inpatient";

export type InpatientAdmissionForm = z.infer<typeof inpatientAdmissionSchema>;

const CreateInpatient = () => {
  const navigate = useNavigate();

  const [searchPhone, setSearchPhone] = useState("");
  const [existingPatient, setExistingPatient] = useState<Patient | null>(null);
  const [searching, setSearching] = useState(false);
  const [useExisting, setUseExisting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<InpatientAdmissionForm>({
    resolver: zodResolver(inpatientAdmissionSchema),
    defaultValues: {
      date_of_admission: new Date().toISOString().split("T")[0], // Today's date
    },
  });

  // Search for existing patient by phone
  const handleSearchPatient = async () => {
    if (!searchPhone || searchPhone.length < 10) {
      showToast.warning("Enter a valid phone number");
      return;
    }

    try {
      setSearching(true);
      const patient = await patientQueries.findByPhone(searchPhone);

      if (patient) {
        setExistingPatient(patient);
        setUseExisting(true);

        // Pre-fill form with existing patient data
        setValue("surname", patient.surname);
        setValue("other_names", patient.other_names);
        setValue("date_of_birth", patient.date_of_birth);
        setValue("gender", patient.gender);
        setValue("phone", patient.phone);
        setValue("email", patient.email ?? "");
        setValue("address", patient.address ?? "");
        setValue("civil_state", patient.civil_state ?? "");
        setValue("occupation", patient.occupation ?? "");
        setValue("place_of_work", patient.place_of_work ?? "");
        setValue("tribe_nationality", patient.tribe_nationality ?? "");
        setValue("next_of_kin", patient.next_of_kin ?? "");
        setValue(
          "relationship_to_patient",
          patient.relationship_to_patient ?? ""
        );
        setValue("address_next_of_kin", patient.address_next_of_kin ?? "");
        setValue("unit_number", patient.unit_number);

        showToast.success(
          "Patient found! Review and complete admission details."
        );
      } else {
        showToast.info("No patient found. Create new patient.");
        setExistingPatient(null);
        setUseExisting(false);
      }
    } catch (error) {
      showToast.error("Error searching for patient");
      console.error(error);
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchPhone("");
    setExistingPatient(null);
    setUseExisting(false);
    reset({
      date_of_admission: new Date().toISOString().split("T")[0],
      gender: "male",
    });
  };

  const onSubmit = async (data: InpatientAdmissionForm) => {
    try {
      let patientId = existingPatient?.id;

      // Step 1: Create patient if new
      if (!useExisting) {
        const newPatientId = nanoid();
        const patientSuccess = await patientQueries.insert({
          id: newPatientId,
          ...data,
        });

        if (!patientSuccess) {
          showToast.error("Failed to create patient");
          return;
        }

        patientId = newPatientId;
      }

      // Step 2: Create inpatient admission
      if (patientId) {
        const admissionId = nanoid();
        const admissionSuccess = await inpatientQueries.insert({
          id: admissionId,
          patient_id: patientId,
          unit_number: data.unit_number,
          ward: data.ward,
          consultant_id: data.consultant_id ?? undefined,
          code_no: data.code_no ?? undefined,
          prov_diagnosis: data.prov_diagnosis,
          date_of_admission: data.date_of_admission,
        });

        if (admissionSuccess) {
          showToast.success("Patient admitted successfully!");
          void navigate(`/patients/${patientId}`);
        } else {
          showToast.error("Failed to create admission");
        }
      }
    } catch (error) {
      showToast.error("Error during admission process");
      console.error(error);
    }
  };

  return (
    <section className="space-y-4">
      {/* Header */}
      <Breadcrumbs pathName="Create Inpatient">
        Create New Inpatient
      </Breadcrumbs>

      <div className="max-w-4xl mx-auto">
        {/* Search Existing Patient */}
        <PatientSearch
          searchPhone={searchPhone}
          setSearchPhone={setSearchPhone}
          searching={searching}
          useExisting={useExisting}
          existingPatient={existingPatient}
          handleClearSearch={handleClearSearch}
          handleSearchPatient={() => void handleSearchPatient()}
        />

        {/* Admission Form */}
        <form
          onSubmit={void handleSubmit(onSubmit)}
          className="rounded-md shadow-sm border border-gray-300 p-6 space-y-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <UserPlus size={24} />
            {useExisting ? "Admission Details" : "Patient & Admission Details"}
          </h2>

          {/* Patient Information Section */}
          <PatientForm
            useExisting={useExisting}
            register={register}
            errors={errors}
          />

          {/* Admission Details Section */}
          <AdmissionForm
            useExisting={useExisting}
            register={register}
            errors={errors}
          />

          {/* Submit Buttons */}
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => void navigate("/patients/inpatient")}
              className="flex items-center gap-2"
            >
              <X size={16} />
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              variant="success"
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Admitting...
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Admit Patient
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default CreateInpatient;
