import { beforeEach, describe, expect, it, vi } from "vitest";
import { SyncQueueService } from "../syncQueue";
import { mockSyncQueueItem } from "../../test/mocks/mockData";

describe("Sync Queue Tests", () => {
  let service: SyncQueueService;

  beforeEach(() => {
    service = new SyncQueueService();
    vi.clearAllMocks();
  });

  describe("addToQueue", () => {
    it("should add item to queue with pending status", async () => {
      // Mock db.execute to return success
      window.db.execute = vi.fn().mockResolvedValue({
        success: true,
        lastInsertRowid: 1,
      });

      const result = await service.addToQueue(mockSyncQueueItem);

      expect(result).toBe(1);
      expect(window.db.execute).toHaveBeenCalledWith(
        expect.stringContaining("INSERT INTO sync_queue"),
        expect.any(Array)
      );
    });
  });

  describe("getAllPendingItems", () => {
    it("should return all pending items with limit", async () => {
      window.db.query = vi.fn().mockResolvedValue([mockSyncQueueItem]);

      const result = await service.getAllPendingItems(50);

      expect(result).toHaveLength(1);
      expect(window.db.query).toHaveBeenCalledWith(
        expect.stringContaining("LIMIT ?"),
        [50]
      );
    });
  });

  describe("updateQueueItemStatus", () => {
    it("should update status", async () => {
      window.db.execute = vi.fn().mockResolvedValue({
        success: true,
      });

      await service.updateQueueItemStatus(1, "synced");

      expect(window.db.execute).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE sync_queue"),
        expect.arrayContaining(["synced"])
      );
    });

    it("should update status with error message", async () => {
      window.db.execute = vi.fn().mockResolvedValue({
        success: true,
      });

      await service.updateQueueItemStatus(1, "conflict", "Phone mismatch");

      expect(window.db.execute).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE sync_queue"),
        expect.arrayContaining(["conflict", "Phone mismatch"])
      );
    });
  });

  describe("incrementRetryCount", () => {
    it("should increment retry count", async () => {
      window.db.execute = vi.fn().mockResolvedValue({ success: true });

      await service.incrementRetryCount(1);

      expect(window.db.execute).toHaveBeenCalledWith(
        expect.stringContaining("SET retry_count = retry_count + 1"),
        [1]
      );
    });
  });

  describe("markAsSyncing", () => {
    it("should mark items as syncing", async () => {
      window.db.execute = vi.fn().mockResolvedValue({ success: true });

      await service.markAsSyncing([1, 2, 5]);

      expect(window.db.execute).toHaveBeenCalledWith(
        expect.stringContaining("SET status = 'syncing'"),
        [1, 2, 5]
      );
    });
  });

  describe("getPendingCount", () => {
    it("should return count of pending items", async () => {
      window.db.queryOne = vi.fn().mockResolvedValue({ count: 10 });

      const result = await service.getPendingCount();

      expect(result).toBe(10);
    });
  });

  describe("getConflictCount", () => {
    it("should return count of conflicts", async () => {
      window.db.queryOne = vi.fn().mockResolvedValue({ count: 10 });

      const result = await service.getConflictCount();

      expect(result).toBe(10);
    });
  });

  describe("getQueueItemsByRecord", () => {
    it("should return items for specific table and record", async () => {
      window.db.query = vi.fn().mockResolvedValue(mockSyncQueueItem);

      const result = await service.getQueueItemsByRecord(
        "patients",
        "patient-123"
      );

      expect(result).toBe(mockSyncQueueItem);
      expect(window.db.query).toHaveBeenCalledWith(
        expect.stringContaining("SELECT * FROM sync_queue"),
        ["patients", "patient-123"]
      );
    });
  });
});
