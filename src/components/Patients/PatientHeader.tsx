import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { patientEditSchema } from "../../services/validation";
import type { Patient } from "../../types/supabase";
import { zodResolver } from "@hookform/resolvers/zod";
import { EditableField } from "../Form";
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
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PatientEditForm>({
    resolver: zodResolver(patientEditSchema),
    defaultValues: patient,
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
    if (isDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to cancel?"
      );
      if (!confirmed) return;
    }

    reset();
    setIsEditing(false);
  };

  const handleEdit = (e?: React.MouseEvent<HTMLButtonElement>) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsEditing(true);
  };

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit(submitEditedData)(e);
      }}
    >
      {/* Actions */}
      <div className="flex justify-end gap-2">
        {isEditing ? (
          <>
            <Button
              type="submit"
              disabled={isSubmitting || !isDirty}
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
              handleEdit(e);
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
                  {patientDetails.slice(0, 2).map((field) => (
                    <div key={field.label} className={field.className ?? ""}>
                      <EditableField
                        field={field}
                        register={register}
                        errors={errors}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <h2 className="text-2xl font-bold text-gray-900">
                  {patient.surname} {patient.other_names}
                </h2>
              )}

              <div className="flex flex-wrap gap-3">
                {isEditing ? (
                  patientDetails.slice(2, 5).map((field) => (
                    <div key={field.label} className={field.className ?? ""}>
                      <EditableField
                        field={field}
                        register={register}
                        errors={errors}
                      />
                    </div>
                  ))
                ) : (
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
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Expandable Details Section */}
        {isEditing && (
          <div className="mt-6 pt-6 border-t border-gray-400 grid grid-cols-1 md:grid-cols-2 gap-4">
            {patientDetails.slice(5).map((field) => (
              <div key={field.label} className={field.className ?? ""}>
                <EditableField
                  field={field}
                  register={register}
                  errors={errors}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </form>
  );
};

export default PatientHeader;
