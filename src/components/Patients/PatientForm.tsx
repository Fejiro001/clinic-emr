import { type FieldErrors, type UseFormRegister } from "react-hook-form";
import { FormInput, FormLabel } from "../Form";
import type { InpatientAdmissionForm } from "../../pages/Inpatients/CreateInpatient";
import { patientForm } from "../../constants/patientForm";

const PatientForm = ({
  useExisting,
  register,
  errors,
}: {
  useExisting: boolean;
  register: UseFormRegister<InpatientAdmissionForm>;
  errors: FieldErrors<InpatientAdmissionForm>;
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b">
        Patient Information
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {patientForm.map((field) => (
          <>
            {field.inputType === "input" ? (
              <div key={field.inputId} className={field.className ?? ""}>
                <FormLabel required={field.required} htmlFor={field.inputId}>
                  {field.label}
                </FormLabel>
                <FormInput
                  id={field.inputId}
                  {...register(field.inputId)}
                  placeholder={field.placeholder}
                  type={field.type ?? "text"}
                  disabled={useExisting}
                />
                {errors[field.inputId] && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors[field.inputId]?.message}
                  </p>
                )}
              </div>
            ) : field.inputType === "textarea" ? (
              <div key={field.inputId} className={field.className ?? ""}>
                <FormLabel required={field.required} htmlFor={field.inputId}>
                  {field.label}
                </FormLabel>
                <textarea
                  id={field.inputId}
                  rows={1}
                  className="w-full input_style"
                  {...register(field.inputId)}
                  placeholder={field.placeholder}
                  disabled={useExisting}
                />
                {errors[field.inputId] && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors[field.inputId]?.message}
                  </p>
                )}
              </div>
            ) : (
              <div>
                <FormLabel required={field.required} htmlFor={field.inputId}>
                  {field.label}
                </FormLabel>
                <select
                  id={field.inputId}
                  {...register(field.inputId)}
                  className="w-full input_style capitalize"
                  disabled={useExisting}
                >
                  <option value="">Select {field.placeholder}</option>
                  {field.options?.map((opt, index) => (
                    <option key={index} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {errors[field.inputId] && (
                  <p className="text-red-600 text-sm mt-1">
                    {errors[field.inputId]?.message}
                  </p>
                )}
              </div>
            )}
          </>
        ))}
      </div>
    </div>
  );
};

export default PatientForm;
