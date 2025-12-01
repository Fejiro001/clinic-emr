import type { Ref } from "react";

interface FormInputProps {
  id: string;
  type?: string;
  placeholder?: string;
  ref?: Ref<HTMLInputElement>;
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
      className="w-full input_style"
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
