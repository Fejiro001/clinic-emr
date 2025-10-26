const FormError = ({ errorMessage }: { errorMessage: string | undefined }) => {
  return <p className="mt-1 text-sm text-red-600">{errorMessage}</p>;
};

export default FormError;
