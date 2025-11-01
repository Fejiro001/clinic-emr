import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import LoginPage from "../pages/LoginPage";
import { ProtectedRoute } from "../components/Auth";
import Layout from "../layout/Layout";
import Dashboard from "../pages/Dashboard";

const AppRoutes = () => {
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
          <Route path="audit-logs" element={<div>Audit Logs Page</div>} />
          <Route path="users" element={<div>Users Page</div>} />
          <Route path="profile" element={<div>Profiles Page</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
