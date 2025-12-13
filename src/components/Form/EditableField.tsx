import type {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";
import FormInput from "./FormInput";
import FormLabel from "./FormLabel";

interface FieldConfig<T extends FieldValues> {
  label: string;
  inputId: Path<T>;
  inputType: "input" | "dropdown" | "textarea";
  type?: string;
  placeholder: string;
  required: boolean;
  className?: string;
  options?: string[];
}

interface EditableFieldProps<T extends FieldValues> {
  field: FieldConfig<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  disabled?: boolean;
}

const EditableField = <T extends FieldValues>({
  field,
  register,
  errors,
  disabled
}: EditableFieldProps<T>) => {
  const fieldError = errors[field.inputId];

  if (field.inputType === "input") {
    return (
      <>
        <FormLabel required={field.required} htmlFor={field.inputId}>
          {field.label}
        </FormLabel>
        <FormInput
          id={field.inputId}
          {...register(field.inputId)}
          placeholder={field.placeholder}
          type={field.type ?? "text"}
          disabled={disabled}
        />
        {fieldError && (
          <p className="text-red-600 text-sm mt-1">
            {fieldError.message as string}
          </p>
        )}
      </>
    );
  }

  if (field.inputType === "textarea") {
    return (
      <>
        <FormLabel required={field.required} htmlFor={field.inputId}>
          {field.label}
        </FormLabel>
        <textarea
          id={field.inputId}
          rows={1}
          className="w-full input_style"
          {...register(field.inputId)}
          placeholder={field.placeholder}
          disabled={disabled}
        />
        {fieldError && (
          <p className="text-red-600 text-sm mt-1">
            {fieldError.message as string}
          </p>
        )}
      </>
    );
  }

  // Dropdown
  return (
    <>
      <FormLabel required={field.required} htmlFor={field.inputId}>
        {field.label}
      </FormLabel>
      <select
        id={field.inputId}
        {...register(field.inputId)}
        className="w-full input_style capitalize"
        disabled={disabled}
      >
        <option value="">Select {field.label}</option>
        {field.options?.map((opt, index) => (
          <option key={index} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      {fieldError && (
        <p className="text-red-600 text-sm mt-1">
          {fieldError.message as string}
        </p>
      )}
    </>
  );
};

export default EditableField;
export type { FieldConfig };
