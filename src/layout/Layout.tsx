// src/components/Layout/Layout.tsx
import { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router";
import { useAuthStore } from "../store/authStore";
import { authService } from "../services/auth";
import { RoleGuard } from "../components/Auth/RoleGuard";
import type { UserRole } from "../types";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await authService.logout();
      setIsLoggingOut(false);
      void navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  const navItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: "📊",
      roles: ["doctor", "secretary", "nurse", "admin"],
    },
    {
      path: "/patients",
      label: "Patients",
      icon: "👥",
      roles: ["doctor", "secretary", "nurse", "admin"],
    },
    {
      path: "/inpatient",
      label: "Inpatient",
      icon: "🏥",
      roles: ["doctor", "nurse", "admin"],
    },
    {
      path: "/outpatient",
      label: "Outpatient",
      icon: "🩺",
      roles: ["doctor", "secretary", "admin"],
    },
    { path: "/audit-logs", label: "Audit Logs", icon: "📋", roles: ["admin"] },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Clinic EMR</h1>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                {`${String(user?.role.charAt(0).toUpperCase())}${String(user?.role.slice(1))}`}
              </span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {user?.full_name}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  setShowLogoutModal(true);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navItems.map((item) => (
              <RoleGuard
                key={item.path}
                allowedRoles={item.roles as UserRole[]}
              >
                <Link
                  to={item.path}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </RoleGuard>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Logout
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout? Any unsaved changes will be lost.
            </p>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowLogoutModal(false);
                }}
                disabled={isLoggingOut}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={(): void => {
                  void handleLogout();
                }}
                disabled={isLoggingOut}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
