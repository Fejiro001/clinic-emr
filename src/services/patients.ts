import {
  inpatientQueries,
  operationQueries,
  outpatientQueries,
  patientQueries,
} from "./queries";
import { usePatientStore } from "../store/patientStore";
import { showToast } from "../utils/toast";
import type { InsertPatient } from "../types/supabase";
import { useInpatientStore } from "../store/inpatientStore";
import { useOutpatientStore } from "../store/outpatientStore";
import { useOperationsStore } from "../store/operationsStore";

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

  async fetchPatientById(id: string) {
    try {
      usePatientStore.getState().setLoading(true);
      usePatientStore.getState().setError("");

      const [patient, inpatientRecords, outpatientVisits] = await Promise.all([
        patientQueries.findById(id),
        inpatientQueries.findByPatientId(id),
        outpatientQueries.findByPatientId(id),
      ]);

      // If no patient found, clear stores and return
      if (!patient) {
        usePatientStore.getState().setPatient(null);
        useInpatientStore.getState().setInpatientRecords([]);
        useOutpatientStore.getState().setOutpatientVisits([]);
        useOperationsStore.getState().setOperations([]);
        throw new Error("Patient not found");
      }

      // Fetch operations for each inpatient record
      const operations = [];
      for (const record of inpatientRecords) {
        const ops = await operationQueries.findByInpatientId(record.id);
        operations.push(...ops);
      }

      usePatientStore.getState().setPatient(patient);
      useInpatientStore.getState().setInpatientRecords(inpatientRecords);
      useOutpatientStore.getState().setOutpatientVisits(outpatientVisits);
      useOperationsStore.getState().setOperations(operations);

      return { patient, inpatientRecords, outpatientVisits, operations };
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to fetch patient details";
      usePatientStore.getState().setError(errorMessage);
      showToast.error(errorMessage);
      throw error;
    } finally {
      usePatientStore.getState().setLoading(false);
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
