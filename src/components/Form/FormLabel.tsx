interface FormLabelProps {
  htmlFor: string;
  children: React.ReactNode;
}

const FormLabel = ({ htmlFor, children }: FormLabelProps) => {
  return (
    <label
      htmlFor={htmlFor}
      className="block text-sm font-medium text-gray-700 ms-1"
    >
      {children}
    </label>
  );
};

export default FormLabel;
