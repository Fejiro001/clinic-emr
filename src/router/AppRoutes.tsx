import { BrowserRouter, Route, Routes } from "react-router";
import LoginPage from "../pages/LoginPage";
import { ProtectedRoute } from "../components/Auth";
import Layout from "../layout/Layout";
import Dashboard from "../pages/Dashboard";
import Patients from "../pages/Patients/Patients";
import Outpatients from "../pages/Outpatients/Outpatients";
import Inpatients from "../pages/Inpatients/Inpatients";
import PatientDetails from "../pages/Patients/PatientDetails";
import CreateInpatient from "../pages/Inpatients/CreateInpatient";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <Layout>
              <ProtectedRoute />
            </Layout>
          }
        >
          <Route index path="/" element={<Dashboard />} />
          <Route path="patients" element={<Patients />} />
          <Route path="patients/details" element={<PatientDetails />} />
          <Route path="patients/inpatients" element={<Inpatients />} />
          <Route
            path="patients/inpatients/create-inpatient"
            element={<CreateInpatient />}
          />
          <Route path="patients/outpatients" element={<Outpatients />} />
          <Route path="audit-logs" element={<div>Audit Logs Page</div>} />
          <Route path="users" element={<div>Users Page</div>} />
          <Route path="profile" element={<div>Profiles Page</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
