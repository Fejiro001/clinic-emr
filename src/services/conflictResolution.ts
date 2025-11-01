import type { SyncConflict } from "../types";
import { showToast } from "../utils/toast";
import { supabase } from "./supabase";
import { syncQueueService } from "./syncQueue";

export class ConflictResolutionService {
  /**
   * Get all unresolved conflict from Supabase
   */
  async getUnresolvedConflicts() {
    const { data, error } = await supabase
      .from("sync_conflicts")
      .select("*")
      .eq("resolved", false)
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("Error fetching unresolved conflicts:", error);
      return [];
    }

    return data as SyncConflict[];
  }

  async resolveConflict(
    conflictId: number,
    choice: "local" | "remote",
    userId: string
  ): Promise<void> {
    const resolutionPromise = this.performResolution(
      conflictId,
      choice,
      userId
    );

    showToast.promise(resolutionPromise, {
      loading: "Resolving conflict...",
      success: "Conflict resolved successfully!",
      error: "Failed to resolve conflict.",
    });

    return resolutionPromise;
  }

  /**
   * Resolve a conflict with the users choice
   */
  private async performResolution(
    conflictId: number,
    choice: "local" | "remote",
    userId: string
  ): Promise<void> {
    const { data: conflict, error: fetchError } = await supabase
      .from("sync_conflicts")
      .select("*")
      .eq("id", conflictId)
      .single();

    if (fetchError || !conflict) {
      throw new Error("Conflict not found");
    }

    const typedConflict = conflict as SyncConflict;

    const dataToUse =
      choice === "local"
        ? typedConflict.local_version
        : typedConflict.remote_version;

    const { error: updateError } = await supabase
      .from(typedConflict.table_name)
      .update(dataToUse)
      .eq("id", typedConflict.record_id);

    if (updateError) throw updateError;

    //   Mark conflict as resolved
    const { error: resolveError } = await supabase
      .from("sync_conflicts")
      .update({
        resolved: true,
        resolution_choice: choice,
        resolved_by: userId,
        resolved_at: new Date().toISOString(),
      })
      .eq("id", conflictId);

    if (resolveError) throw resolveError;

    //   Find and remove the conflicting item from sync_queue
    const queueItems = await syncQueueService.getQueueItemsByRecord(
      typedConflict.table_name,
      typedConflict.record_id
    );

    for (const item of queueItems) {
      if (item.status === "conflict" && item.id != null) {
        await syncQueueService.updateQueueItemStatus(item.id, "synced");
      }
    }
  }

  /**
   * Get conflict count
   */
  async getConflictCount(): Promise<number> {
    const { count, error } = await supabase
      .from("sync_conflicts")
      .select("*", { count: "exact", head: true })
      .eq("resolved", false);

    if (error) return 0;
    return count ?? 0;
  }
}

export const conflictResolutionService = new ConflictResolutionService();
