import type { Ref } from "react";

interface FormInputProps {
  id: string;
  type: string;
  placeholder?: string;
  ref: Ref<HTMLInputElement>;
  disabled?: boolean;
  autoComplete?: string;
}

const FormInput = ({
  id,
  type = "text",
  placeholder = "",
  ref,
  disabled,
  autoComplete,
  ...rest
}: FormInputProps) => {
  return (
    <input
      className="w-full border border-gray-300 p-2 rounded-sm focus:outline-none focus:ring focus:ring-blue-800 disabled:opacity-50"
      disabled={disabled}
      id={id}
      type={type}
      placeholder={placeholder}
      {...rest}
      ref={ref}
      autoComplete={autoComplete}
    />
  );
};

export default FormInput;
