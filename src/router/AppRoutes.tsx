import { BrowserRouter, Route, Routes } from "react-router";
import LoginPage from "../pages/LoginPage";
import { ProtectedRoute } from "../components/Auth";
import Layout from "../layout/Layout";
import Dashboard from "../pages/Dashboard";
import PatientsPage from "../pages/Patients/PatientsPage";
import OutpatientPage from "../pages/Patients/OutpatientPage";
import InpatientPage from "../pages/Patients/InpatientPage";

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
          <Route index path="/" element={<Dashboard />} />
          <Route path="patients" element={<PatientsPage />}>
            <Route path="inpatient" element={<InpatientPage />} />
            <Route path="outpatient" element={<OutpatientPage />} />
          </Route>
          <Route path="audit-logs" element={<div>Audit Logs Page</div>} />
          <Route path="users" element={<div>Users Page</div>} />
          <Route path="profile" element={<div>Profiles Page</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
