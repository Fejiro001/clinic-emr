import { useForm } from "react-hook-form";
import { z } from "zod";
import { loginSchema } from "../services/validation.js";
import { zodResolver } from "@hookform/resolvers/zod";
import { FormError, FormInput, FormLabel } from "../components/Form/index.js";
import { authService } from "../services/auth.js";
import { useNavigate } from "react-router";
import { useState } from "react";
import { CircleX } from "lucide-react";
import { Button } from "../components/Common/index.js";

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
    setError("");

    const result = await authService.login(data);

    if (result.success) {
      void navigate("/dashboard");
    } else {
      setError(result.error ?? "Login failed. Please check your credentials");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Celian Clinic EMR</h1>
          <p className="text-gray-600 mt-2">
            Electronic Medical Records System
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex gap-2 items-center text-red-800 text-sm">
              <CircleX size={18} />
              <p>{error}</p>
            </div>
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
              autoComplete="email"
              type="email"
              id="email"
              placeholder="me@example.com"
              disabled={isSubmitting}
            />
            {errors.email && <FormError errorMessage={errors.email.message} />}
          </div>

          <div>
            <FormLabel htmlFor="password">Password</FormLabel>
            <FormInput
              autoComplete="current-password"
              {...register("password")}
              type="password"
              id="password"
              placeholder="••••••••••"
              disabled={isSubmitting}
            />
            {errors.password && (
              <FormError errorMessage={errors.password.message} />
            )}
          </div>

          {/* Submit Button */}
          <Button
            isLoading={isSubmitting}
            fullWidth={true}
            type="submit"
            disabled={isSubmitting}
            loadingText="Logging in..."
          >
            Login
          </Button>
        </form>

        {/* Help Text */}
        <div className="mt-6 text-center text-sm text-slate-700">
          <p>Only authorized staff can access this system.</p>
          <p className="mt-1">Contact your administrator for access.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
