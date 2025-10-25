import { useEffect, useRef, useState } from "react";
import { useActivityTracker } from "./hooks/useActivityTracker";
import { authService } from "./services/auth";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import LoginPage from "./pages/LoginPage";
import { ProtectedRoute } from "./components/Auth";
import Layout from "./layout/Layout";
import Dashboard from "./pages/Dashboard";

function App() {
  const [initialized, setInitialized] = useState(false);
  const initRef = useRef(false);

  useActivityTracker();

  useEffect(() => {
    async function init() {
      if (initRef.current) return;
      initRef.current = true;

      await authService.initializeSession();
      setInitialized(true);
    }

    void init();
  }, []);

  if (!initialized) {
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
          <Route path="inpatient" element={<div>Inpatients Page</div>} />
          <Route path="outpatient" element={<div>Outpatients Page</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
