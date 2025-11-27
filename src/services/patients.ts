import { patientQueries } from "./queries";
import { usePatientStore } from "../store/patientStore";
import { showToast } from "../utils/toast";
import type { InsertPatient } from "../types/supabase";

export class PatientsService {
  async fetchAllPatients(limit = 50, offset = 0) {
    try {
      const patients = await patientQueries.getAll(limit, offset);
      usePatientStore.getState().setPatients(patients);
      return patients;
    } catch (error) {
      usePatientStore
        .getState()
        .setError(
          error instanceof Error ? error.message : "Failed to fetch patients"
        );
      throw error;
    }
  }

  async insertNewPatient(data: InsertPatient) {
    try {
      await patientQueries.insert(data);
      showToast.success("Successfully added patient!");
    } catch (error) {
      showToast.error(
        error instanceof Error ? error.message : "Failed to add patient."
      );
    }
  }
}

export const patientsService = new PatientsService();
