import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { patientEditSchema } from "../../services/validation";
import type { Patient } from "../../types/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormInput, FormLabel } from "../Form";
import {
  Calendar,
  Edit2,
  Mail,
  MapPin,
  Phone,
  Save,
  User,
  X,
} from "lucide-react";
import { calculateAge } from "../../utils/dateUtils";
import { patientQueries } from "../../services/queries";
import { showToast } from "../../utils/toast";

type PatientEditForm = z.infer<typeof patientEditSchema>;

interface PatientHeaderProps {
  patient: Patient;
  onUpdate: (updated: Patient) => void;
  isCurrentlyAdmitted?: boolean;
}

const PatientHeader = ({
  patient,
  onUpdate,
  isCurrentlyAdmitted,
}: PatientHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PatientEditForm>({
    resolver: zodResolver(patientEditSchema),
    defaultValues: {
      surname: patient.surname,
      other_names: patient.other_names,
      phone: patient.phone,
      email: patient.email ?? "",
      address: patient.address ?? "",
      civil_state: patient.civil_state ?? "",
      occupation: patient.occupation ?? "",
      place_of_work: patient.place_of_work ?? "",
      tribe_nationality: patient.tribe_nationality ?? "",
      next_of_kin: patient.next_of_kin ?? "",
      relationship_to_patient: patient.relationship_to_patient ?? "",
      address_next_of_kin: patient.address_next_of_kin ?? "",
    },
  });

  const submitEditedData = async (data: PatientEditForm) => {
    try {
      const success = await patientQueries.updateRecord(patient.id, {
        surname: data.surname,
        other_names: data.other_names,
        phone: data.phone,
        email: data.email ?? undefined,
        address: data.address ?? undefined,
        civil_state: data.civil_state ?? undefined,
        occupation: data.occupation ?? undefined,
        place_of_work: data.place_of_work ?? undefined,
        tribe_nationality: data.tribe_nationality ?? undefined,
        next_of_kin: data.next_of_kin ?? undefined,
        relationship_to_patient: data.relationship_to_patient ?? undefined,
        address_next_of_kin: data.address_next_of_kin ?? undefined,
      });

      if (success) {
        // Update local state
        onUpdate({ ...patient, ...data });
        setIsEditing(false);
        showToast.success("Patient information updated successfully");
      } else {
        showToast.error("Failed to update patient information");
      }
    } catch (error) {
      showToast.error("Failed to update patient information");
      console.error("Update error:", error);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

//   const handleEdit = () => {
//     // Reset form with current patient data when entering edit mode
//     reset({
//       surname: patient.surname,
//       other_names: patient.other_names,
//       phone: patient.phone,
//       email: patient.email ?? "",
//       address: patient.address ?? "",
//       civil_state: patient.civil_state ?? "",
//       occupation: patient.occupation ?? "",
//       place_of_work: patient.place_of_work ?? "",
//       tribe_nationality: patient.tribe_nationality ?? "",
//       next_of_kin: patient.next_of_kin ?? "",
//       relationship_to_patient: patient.relationship_to_patient ?? "",
//       address_next_of_kin: patient.address_next_of_kin ?? "",
//     });
//     setIsEditing(true);
//   };

  return (
    <form
      onSubmit={void handleSubmit(submitEditedData)}
      className="bg-white rounded-md shadow-lg border border-gray-200 p-6"
    >
      <div className="border-b pb-4 border-b-gray-400">
        {!isCurrentlyAdmitted && (
          <div className="mb-4 px-2 py-1 bg-primary-50 border border-primary-200 rounded-md w-fit">
            <span className="text-primary-800 font-medium text-sm">
              ℹ️ Currently Admitted
            </span>
          </div>
        )}

        <div className="flex items-start justify-between">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
              {patient.surname[0]}
              {patient.other_names[0]}
            </div>

            {/* Patient Details */}
            <div className="space-y-2 flex-1">
              {isEditing ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <div>
                      <FormLabel htmlFor="surname">Surname</FormLabel>
                      <FormInput
                        {...register("surname")}
                        id="surname"
                        placeholder="Surname"
                      />
                      {errors.surname && (
                        <p className="text-red-700 text-sm mt-1">
                          {errors.surname.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <FormLabel htmlFor="other_names">Other Names</FormLabel>
                      <FormInput
                        {...register("other_names")}
                        id="other_names"
                        placeholder="Other Names"
                      />
                      {errors.other_names && (
                        <p className="text-red-700 text-sm mt-1">
                          {errors.other_names.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <h2 className="text-2xl font-bold text-gray-900">
                  {patient.surname} {patient.other_names}
                </h2>
              )}

              {/* Basic Info Row */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <User size={16} />
                  <span className="capitalize">{patient.gender}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={16} />
                  <span>{calculateAge(patient.date_of_birth)} years old</span>
                </div>
                <div className="text-gray-700 text-lg">•</div>
                <span>Unit: {patient.unit_number}</span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                {isEditing ? (
                  <>
                    <div>
                      <div className="flex items-center gap-2">
                        <Phone size={16} className="text-gray-500" />
                        <FormInput
                          id="tel"
                          type="tel"
                          {...register("phone")}
                          placeholder="Phone"
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-red-500 text-xs mt-1 ml-6">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Mail size={16} className="text-gray-500" />
                        <FormInput
                          id="email"
                          {...register("email")}
                          type="email"
                          placeholder="Email (optional)"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1 ml-6">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-gray-700">
                      <Phone size={16} className="text-gray-400" />
                      <span>{patient.phone}</span>
                    </div>
                    {patient.email && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Mail size={16} className="text-gray-400" />
                        <span>{patient.email}</span>
                      </div>
                    )}
                    {patient.address && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <MapPin size={16} className="text-gray-400" />
                        <span className="max-w-xs truncate">
                          {patient.address}
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Save size={16} />
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
                >
                  <X size={16} />
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                // onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Edit2 size={16} />
                Edit
              </button>
            )}
          </div>
        </div>

        {/* Expandable Details Section - Only show in edit mode */}
        {isEditing && (
          <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                {...register("address")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="Patient address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Civil State
              </label>
              <input
                type="text"
                {...register("civil_state")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Single, Married"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Occupation
              </label>
              <input
                type="text"
                {...register("occupation")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Patient occupation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Place of Work
              </label>
              <input
                type="text"
                {...register("place_of_work")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Workplace"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tribe/Nationality
              </label>
              <input
                type="text"
                {...register("tribe_nationality")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tribe or nationality"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next of Kin
              </label>
              <input
                type="text"
                {...register("next_of_kin")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Emergency contact name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship to Patient
              </label>
              <input
                type="text"
                {...register("relationship_to_patient")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Spouse, Parent, Sibling"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Next of Kin Address
              </label>
              <input
                type="text"
                {...register("address_next_of_kin")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Emergency contact address"
              />
            </div>
          </div>
        )}
      </div>
    </form>
  );
};

export default PatientHeader;
