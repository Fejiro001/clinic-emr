import type { Ref } from "react";

interface FormInputProps {
  id: string;
  type: string;
  placeholder?: string;
  ref: Ref<HTMLInputElement>;
  disabled?: boolean;
}

const FormInput = ({
  id,
  type = "text",
  placeholder = "",
  ref,
  disabled,
  ...rest
}: FormInputProps) => {
  return (
    <input disabled={disabled} id={id} type={type} placeholder={placeholder} {...rest} ref={ref} />
  );
};

export default FormInput;
