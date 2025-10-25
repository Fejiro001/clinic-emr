import { useEffect } from "react";
import { useActivityTracker } from "./hooks/useActivityTracker";
import { useAuthStore } from "./store/authStore";
import { authService } from "./services/auth";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import LoginPage from "./pages/LoginPage";
import { ProtectedRoute } from "./components/Auth";
import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard";

function App() {
  const { isLoading } = useAuthStore();

  useActivityTracker();

  useEffect(() => {
    void authService.initializeSession();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading Clinic EMR...</p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="patients" element={<div>Patients Page</div>} />
          <Route path="appointments" element={<div>Appointments Page</div>} />
          <Route path="settings" element={<div>Settings Page</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
