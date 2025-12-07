interface FormLabelProps {
  htmlFor: string;
  children: React.ReactNode;
  required?: boolean;
}

const FormLabel = ({ htmlFor, children, required = false }: FormLabelProps) => {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-700 ms-1"
    >
      {children} {required && <span className="text-red-600">*</span>}
    </label>
  );
};

export default FormLabel;
