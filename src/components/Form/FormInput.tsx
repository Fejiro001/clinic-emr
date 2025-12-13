import type { Ref } from "react";

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
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
  disabled,
  autoComplete,
  ref,
  ...rest
}: FormInputProps) => {
  return (
    <input
      className="w-full input_style"
      disabled={disabled}
      id={id}
      type={type}
      placeholder={placeholder}
      ref={ref}
      autoComplete={autoComplete}
      {...rest}
    />
  );
};

export default FormInput;
