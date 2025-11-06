import { beforeEach, describe, expect, it } from "vitest";
import { ConflictDetectionService } from "../conflictDetection";
import { mockPatient } from "../../test/mocks/mockData";

describe("ConflictDetection Tests", () => {
  let service: ConflictDetectionService;

  beforeEach(() => {
    service = new ConflictDetectionService();
  });

  describe("detect conflict", () => {
    it("should return null when versions match", () => {
      const localData = { ...mockPatient, version: 1 };
      const remoteData = { ...mockPatient, version: 1 };

      const result = service.detectConflict(
        "patients",
        "patient-123",
        localData,
        remoteData
      );

      expect(result).toBeNull();
    });

    it("should detect conflict when versions differ", () => {
      const localData = {
        ...mockPatient,
        version: 1,
        phone: "07088852002",
        address: "Old Address",
      };
      const remoteData = {
        ...mockPatient,
        version: 3,
        phone: "08075853868",
        address: "New Address",
      };

      const result = service.detectConflict(
        "patients",
        "patient-123",
        localData,
        remoteData
      );

      expect(result).not.toBeNull();
      expect(result?.changedFields).toHaveLength(2);
      expect(result?.changedFields[0].fieldName).toBe("phone");
      expect(result?.changedFields[0].strategy).toBe("prefer_remote");
      expect(result?.changedFields[1].fieldName).toBe("address");
      expect(result?.changedFields[1].strategy).toBe("prefer_recent");
    });

    it("should flag conflict for review if any changed field requires review", () => {
      const localData = {
        ...mockPatient,
        version: 1,
        surname: "Coker",
      };
      const remoteData = {
        ...mockPatient,
        version: 2,
        surname: "Okoro",
      };

      const result = service.detectConflict(
        "patients",
        "patient-123",
        localData,
        remoteData
      );

      expect(result).not.toBeNull();
      expect(result?.requiresReview).toBe(true);
    });

    it("should return null if no fields changed despite version difference", () => {
      const localData = { ...mockPatient, version: 1 };
      const remoteData = { ...mockPatient, version: 2 };

      const result = service.detectConflict(
        "patients",
        "patient-123",
        localData,
        remoteData
      );

      expect(result).toBeNull();
    });

    it("should ignore system fields when detecting changes", () => {
      const localData = { ...mockPatient, version: 1, synced_at: "2024-01-01" };
      const remoteData = {
        ...mockPatient,
        version: 2,
        synced_at: "2024-01-02",
      };

      const result = service.detectConflict(
        "patients",
        "patient-123",
        localData,
        remoteData
      );

      const hasSyncedAtChange = result?.changedFields.some(
        (field) => field.fieldName === "synced_at"
      );

      expect(hasSyncedAtChange).toBeFalsy();
    });
  });
});
