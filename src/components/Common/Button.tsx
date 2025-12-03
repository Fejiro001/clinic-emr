import { Loader2 } from "lucide-react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "outline"
  | "disabled";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProp extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  loadingText?: string;
}

const Button = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  fullWidth = false,
  children,
  disabled,
  className = "",
  type = "button",
  loadingText,
  ...props
}: ButtonProp) => {
  const baseStyle =
    "font-medium rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      "bg-primary-600 text-white hover:bg-blue-800 focus-visible:ring-blue-500",
    secondary:
      "bg-gray-600 text-white hover:bg-gray-800 focus-visible:ring-gray-500",
    success:
      "bg-green-600 text-white hover:bg-green-800 focus-visible:ring-green-500",
    danger: "bg-red-600 text-white hover:bg-red-800 focus-visible:ring-red-500",
    outline:
      "border border-gray-300 text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500",
    disabled: "bg-gray-200 text-gray-400 cursor-not-allowed",
  };
  const sizeStyles: Record<ButtonSize, string> = {
    sm: "px-2 py-1 text-sm",
    md: "px-3 py-2 text-base",
    lg: "px-5 py-3 text-lg",
  };
  const widthStyle = fullWidth ? "w-full" : "";
  const buttonClasses = `${baseStyle} ${variantStyles[variant]} ${
    sizeStyles[size]
  } ${widthStyle} ${className}`.trim();

  return (
    <button
      type={type}
      disabled={disabled ?? isLoading}
      className={buttonClasses}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="animate-spin" />
          {loadingText ?? "Loading..."}
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
