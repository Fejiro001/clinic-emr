import { useForm } from "react-hook-form";
import { z } from "zod";
import { loginSchema } from "../services/validation.js";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormError, FormInput, FormLabel } from "../components/Auth/index.js";
import { authService } from "../services/auth.js";
import { useNavigate } from "react-router";
import { useState } from "react";

type LoginForm = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onLogin = async (data: LoginForm) => {
    console.log("Logging in with data:", data);
    const result = await authService.login(data);

    if (result.success) {
      console.log("Login successful:", result);
      void navigate("/dashboard");
    } else {
      console.error("Login failed");
      setError("Login failed. Please check your credentials");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Clinic EMR</h1>
          <p className="text-gray-600 mt-2">
            Electronic Medical Records System
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form
          onSubmit={(e) => {
            void handleSubmit(onLogin)(e);
          }}
          className="flex flex-col gap-6"
        >
          <div>
            <FormLabel htmlFor="email">Email</FormLabel>
            <FormInput
              {...register("email")}
              type="email"
              id="email"
              placeholder="doctor@clinic.com"
              disabled={isSubmitting}
            />
            {errors.email && <FormError errorMessage={errors.email.message} />}
          </div>

          <div>
            <FormLabel htmlFor="password">Password</FormLabel>
            <FormInput
              {...register("password")}
              type="password"
              id="password"
              placeholder="........"
              disabled={isSubmitting}
            />
            {errors.password && (
              <FormError errorMessage={errors.password.message} />
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Only authorized staff can access this system.</p>
          <p className="mt-1">Contact your administrator for access.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
