import type { ConflictInfo, FieldConflict } from "../types";
import { CONFLICT_RULES } from "./conflictRules";

export class ConflictDetectionService {
  /**
   * Detect conflicts between local and remote records
   */
  detectConflict(
    tableName: string,
    recordId: string,
    localData: Record<string, unknown>,
    remoteData: Record<string, unknown>
  ): ConflictInfo | null {
    // If versions are the same, no conflict
    if (
      (localData as { version: number }).version ===
      (remoteData as { version: number }).version
    ) {
      return null; // No conflict
    }

    // Find out the fields that were changed
    const changedFields = this.findChangedFields(
      tableName,
      localData,
      remoteData
    );

    if (changedFields.length === 0) {
      return null; // No conflicting fields
    }

    const requiresReview = changedFields.some(
      (field) => field.strategy === "flag_for_review"
    );

    return {
      tableName,
      recordId,
      localData,
      remoteData,
      requiresReview,
      changedFields,
    };
  }

  /**
   * Identify fields that have changed and their conflict strategies
   */
  private findChangedFields(
    tableName: string,
    local: Record<string, unknown>,
    remote: Record<string, unknown>
  ): FieldConflict[] {
    const conflicts: FieldConflict[] = [];
    const rules = CONFLICT_RULES[tableName];

    // Ignore system fields
    const ignoreFields = [
      "id",
      "created_at",
      "created_by",
      "updated_at",
      "updated_by",
      "deleted_at",
      "version",
      "synced_at",
    ];

    for (const field in local) {
      if (!Object.hasOwn(ignoreFields, field)) continue;

      const localValue = local[field];
      const remoteValue = remote[field];

      if (localValue !== remoteValue) {
        conflicts.push({
          fieldName: field,
          localValue,
          remoteValue,
          strategy: rules[field],
        });
      }
    }

    return conflicts;
  }
}

export const conflictDetectionService = new ConflictDetectionService();
