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
import { patientDetails } from "../../constants/patientDetails";
import { Button } from "../Common";

export type PatientEditForm = z.infer<typeof patientEditSchema>;

export interface PatientHeaderProps {
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
      gender: patient.gender,
      date_of_birth: patient.date_of_birth,
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
      const success = await patientQueries.updateRecord(patient.id, data);

      if (success) {
        onUpdate({ ...patient, ...data });
        setIsEditing(false);
        showToast.success("Patient information updated successfully");
      } else {
        showToast.error("Failed to update patient information");
      }
    } catch {
      showToast.error("Failed to update patient information");
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const handleEdit = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();

    reset({
      surname: patient.surname,
      other_names: patient.other_names,
      phone: patient.phone,
      gender: patient.gender,
      date_of_birth: patient.date_of_birth,
      email: patient.email ?? "",
      address: patient.address ?? "",
      civil_state: patient.civil_state ?? "",
      occupation: patient.occupation ?? "",
      place_of_work: patient.place_of_work ?? "",
      tribe_nationality: patient.tribe_nationality ?? "",
      next_of_kin: patient.next_of_kin ?? "",
      relationship_to_patient: patient.relationship_to_patient ?? "",
      address_next_of_kin: patient.address_next_of_kin ?? "",
    });
    setIsEditing(true);
  };

  return (
    <>
      <form
        className="space-y-2"
        onSubmit={(e) => {
          void handleSubmit(submitEditedData)(e);
        }}
      >
        {/* Right: Actions */}
        <div className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <Button
                type="submit"
                disabled={isSubmitting}
                variant="success"
                className="flex items-center gap-2"
              >
                <Save size={16} />
                {isSubmitting ? "Saving..." : "Save"}
              </Button>
              <Button
                onClick={handleCancel}
                disabled={isSubmitting}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <X size={16} />
                Cancel
              </Button>
            </>
          ) : (
            <Button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleEdit();
              }}
              className="flex items-center gap-2"
            >
              <Edit2 size={16} />
              Edit
            </Button>
          )}
        </div>

        <div className="bg-white rounded-md shadow-md shadow-dark-surface border border-gray-200 p-6">
          {isCurrentlyAdmitted && (
            <div className="mb-4 px-2 py-1 bg-primary-50 border border-primary-200 rounded-md w-fit">
              <span className="text-primary-800 font-medium text-sm">
                ℹ️ Currently Admitted
              </span>
            </div>
          )}

          <div className="flex items-start justify-between">
            <div className="flex gap-4">
              {!isEditing && (
                <div className="patient_initials">
                  {patient.surname[0]}
                  {patient.other_names[0]}
                </div>
              )}

              {/* Patient Details */}
              <div className="space-y-3">
                {isEditing ? (
                  <div className="flex gap-3">
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
                ) : (
                  <h2 className="text-2xl font-bold text-gray-900">
                    {patient.surname} {patient.other_names}
                  </h2>
                )}

                <div className="flex flex-wrap gap-3">
                  {isEditing ? (
                    <>
                      <div>
                        <FormLabel htmlFor="gender">Gender</FormLabel>
                        <select
                          id="gender"
                          {...register("gender")}
                          className="input_style"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                        </select>
                        {errors.gender && (
                          <p className="text-red-500 text-xs mt-1 ml-6">
                            {errors.gender.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <FormLabel htmlFor="date_of_birth">
                          Date of Birth
                        </FormLabel>
                        <FormInput
                          id="date_of_birth"
                          type="date"
                          {...register("date_of_birth")}
                          placeholder="Date of Birth"
                        />
                        {errors.date_of_birth && (
                          <p className="text-red-500 text-xs mt-1 ml-6">
                            {errors.date_of_birth.message}
                          </p>
                        )}
                      </div>

                      <div>
                        <FormLabel htmlFor="phone">Phone Number</FormLabel>
                        <FormInput
                          id="phone"
                          type="tel"
                          {...register("phone")}
                          placeholder="Phone"
                        />
                        {errors.phone && (
                          <p className="text-red-500 text-xs mt-1 ml-6">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
                        <div className="patient_header_icons">
                          <User size={16} />
                          <span className="capitalize">{patient.gender}</span>
                        </div>

                        <div className="patient_header_icons">
                          <Calendar size={16} />
                          <span>
                            {calculateAge(patient.date_of_birth)} years old
                          </span>
                        </div>

                        <div className="patient_header_icons">
                          <Phone size={16} />
                          <span>{patient.phone}</span>
                        </div>

                        {patient.email && (
                          <div className="patient_header_icons">
                            <Mail size={16} />
                            <span>{patient.email}</span>
                          </div>
                        )}

                        {patient.address && (
                          <div className="patient_header_icons">
                            <MapPin size={16} />
                            <span className="max-w-xs truncate">
                              {patient.address}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Expandable Details Section - Only show in edit mode */}
          {isEditing && (
            <div className="mt-6 pt-6 border-t border-gray-400 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormLabel htmlFor="address">Address</FormLabel>
                <textarea
                  id="address"
                  className="w-full input_style"
                  {...register("address")}
                  rows={1}
                  placeholder="Patient address"
                />
              </div>

              {patientDetails.map((details) => (
                <div key={details.inputId}>
                  <FormLabel htmlFor={details.inputId}>
                    {details.label}
                  </FormLabel>
                  <FormInput
                    id={details.inputId}
                    type={details.type}
                    {...register(details.inputId)}
                    placeholder={details.placeholder}
                  />
                </div>
              ))}

              <div>
                <FormLabel htmlFor="address_next_of_kin">
                  Next of Kin Address
                </FormLabel>
                <textarea
                  id="address_next_of_kin"
                  className="w-full input_style"
                  {...register("address_next_of_kin")}
                  rows={1}
                  placeholder="Emergency contact address"
                />
              </div>
            </div>
          )}
        </div>
      </form>
    </>
  );
};

export default PatientHeader;
