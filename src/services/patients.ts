import { patientQueries } from "./queries";
import { usePatientStore } from "../store/patientStore";

export class PatientsService {
  async fetchAllPatients(limit = 50, offset = 0) {
    try {
      usePatientStore.getState().setLoading(true);
      usePatientStore.getState().setError("");

      const patients = await patientQueries.getAllPatients(limit, offset);
      usePatientStore.getState().setPatients(patients);
      return patients;
    } catch (error) {
      console.error("Error fetching patients:", error);
      usePatientStore
        .getState()
        .setError(
          error instanceof Error ? error.message : "Failed to fetch patients"
        );
      throw error;
    } finally {
      usePatientStore.getState().setLoading(false);
    }
  }
}

export const patientsService = new PatientsService();
