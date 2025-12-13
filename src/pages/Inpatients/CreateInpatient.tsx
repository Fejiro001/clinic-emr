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
import { PatientSearch } from "../../components/Patients";
import { admissionForm } from "../../constants/admissionForm";
import { EditableField } from "../../components/Form";
import { patientForm } from "../../constants/patientForm";

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
        setValue("religion", patient.religion ?? "");
        setValue("tribe_nationality", patient.tribe_nationality ?? "");
        setValue("next_of_kin", patient.next_of_kin ?? "");
        setValue(
          "relationship_to_patient",
          patient.relationship_to_patient ?? ""
        );
        setValue("address_next_of_kin", patient.address_next_of_kin ?? "");

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
          surname: data.surname,
          other_names: data.other_names,
          date_of_birth: data.date_of_birth,
          gender: data.gender,
          phone: data.phone,
          email: data.email ?? undefined,
          address: data.address,
          civil_state: data.civil_state ?? undefined,
          occupation: data.occupation ?? undefined,
          place_of_work: data.place_of_work ?? undefined,
          tribe_nationality: data.tribe_nationality ?? undefined,
          next_of_kin: data.next_of_kin,
          relationship_to_patient: data.relationship_to_patient,
          address_next_of_kin: data.address_next_of_kin,
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
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit(onSubmit)(e);
          }}
          className="rounded-md shadow-sm border border-gray-300 p-6 space-y-6"
        >
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <UserPlus size={24} />
            {useExisting ? "Admission Details" : "Patient & Admission Details"}
          </h2>

          {/* Patient Information Section */}
          <article>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
              Patient Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patientForm.map((field) => (
                <div key={field.label} className={field.className ?? ""}>
                  <EditableField
                    field={field}
                    register={register}
                    errors={errors}
                    disabled={useExisting}
                  />
                </div>
              ))}
            </div>
          </article>

          {/* Admission Details Section */}
          <article>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
              Admission Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {admissionForm.map((field) => (
                <div key={field.label} className={field.className ?? ""}>
                  <EditableField
                    field={field}
                    register={register}
                    errors={errors}
                  />
                </div>
              ))}
            </div>
          </article>

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
