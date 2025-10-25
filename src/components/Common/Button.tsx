interface ButtonProp {
  children: React.ReactNode;
  disabled: boolean;
}

const Button = ({ children, disabled }: ButtonProp) => {
  return (
    <button
      className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
