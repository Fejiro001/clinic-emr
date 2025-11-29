import { useEffect } from "react";
import { Navigate, useLocation } from "react-router";
import { usePatientStore } from "../../store/patientStore";
import { patientsService } from "../../services/patients";

const PatientDetails = () => {
  const location = useLocation();
  const { patientId } = location.state as { patientId: string };
  const { selectedPatient } = usePatientStore();

  useEffect(() => {
    void patientsService.fetchPatientById(patientId);
  }, [patientId]);

  if (!patientId) {
    return <Navigate to="/patients" />;
  }

  return (
    <div>
      {selectedPatient ? (
        <div>
          <h2>Patient Details</h2>
          <p>Name: {selectedPatient.surname}</p>
          <p>Age: {selectedPatient.other_names}</p>
          <p>Gender: {selectedPatient.gender}</p>
          {/* Add more patient details as needed */}
        </div>
      ) : (
        <p>Loading patient details...</p>
      )}
    </div>
  );
};

export default PatientDetails;
