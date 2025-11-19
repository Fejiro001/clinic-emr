import { Navigate, useLocation } from "react-router";
import { useAuthStore } from "../../store/authStore";
import type { UserRole } from "../../types";
import { Preloader } from "../Common";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredAuth?: boolean;
}

const ProtectedRoute = ({
  children,
  allowedRoles,
  requiredAuth = true,
}: ProtectedRouteProps) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return <Preloader />;
  }

  // if (requiredAuth && !isAuthenticated) {
  //   return <Navigate to="/login" state={{ from: location }} replace />;
  // }
  // Check role-based access
  if (allowedRoles && user) {
    const hasRequiredRole = allowedRoles.includes(user.role);

    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Your role: <span className="font-semibold">{user.role}</span>
              <br />
              Required roles:{" "}
              <span className="font-semibold">{allowedRoles.join(", ")}</span>
            </p>
            <button
              onClick={() => {
                window.history.back();
              }}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Go Back
            </button>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
