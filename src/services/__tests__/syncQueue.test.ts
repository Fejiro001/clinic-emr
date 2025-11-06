import { beforeEach, describe, expect, it, vi } from "vitest";
import { SyncQueueService } from "../syncQueue";
import { mockSyncQueueItem } from "../../test/mocks/mockData";

describe("Sync Queue Tests", () => {
  let service: SyncQueueService;

  beforeEach(() => {
    service = new SyncQueueService();
  });

  describe("addToQueue", () => {
    it("should add an item to queue with pending status", async () => {
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
    it("should get all pending items", async () => {
      window.db.query = vi.fn().mockResolvedValue([mockSyncQueueItem]);

      const result = await service.getAllPendingItems(50);

      expect(result).toHaveLength(1);
      expect(window.db.query).toHaveBeenCalledWith(
        expect.stringContaining("LIMIT ?"),
        [50]
      );
    });

    it("should limit results", async () => {
      const items = Array(100).fill(mockSyncQueueItem);
      window.db.query = vi.fn().mockResolvedValue(items);

      await service.getAllPendingItems(50);

      expect(window.db.query).toHaveBeenCalledWith(
        expect.stringContaining("LIMIT ?"),
        [50]
      );
    });
  });

  describe("updateQueueItemStatus", () => {
    it("should update the status of the queued item", async () => {
      window.db.execute = vi.fn().mockResolvedValue({
        success: true,
      });

      await service.updateQueueItemStatus(1, "synced");

      expect(window.db.execute).toHaveBeenCalledWith(
        expect.stringContaining("UPDATE sync_queue"),
        expect.arrayContaining(["synced"])
      );
    });

    it("should update the status to conflict with error message", async () => {
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
    it("increment the retry count for failed items", async () => {
      window.db.execute = vi.fn().mockResolvedValue({ success: true });

      await service.incrementRetryCount(1);

      expect(window.db.execute).toHaveBeenCalledWith(
        expect.stringContaining("SET retry_count = retry_count + 1"),
        [1]
      );
    });
  });

  describe("markAsSyncing", () => {
    it("mark all offline items as syncing when online", async () => {
      window.db.execute = vi.fn().mockResolvedValue({ success: true });

      await service.markAsSyncing([1, 2, 5]);

      expect(window.db.execute).toHaveBeenCalledWith(
        expect.stringContaining("SET status = 'syncing'"),
        [1, 2, 5]
      );
    });
  });

  describe("getPendingCount", () => {
    it("should get count of pending items", async () => {
      window.db.queryOne = vi.fn().mockResolvedValue({ count: 10 });

      const result = await service.getPendingCount();

      expect(result).toBe(10);
    });

    it("should return 0 if no pending items", async () => {
      window.db.queryOne = vi.fn().mockResolvedValue({ count: 0 });

      const result = await service.getPendingCount();

      expect(result).toBe(0);
    });
  });

  describe("getConflictCount", () => {
    it("should get count of conflicting items", async () => {
      window.db.queryOne = vi.fn().mockResolvedValue({ count: 10 });

      const result = await service.getConflictCount();

      expect(result).toBe(10);
    });

    it("should return 0 if no conflicting items", async () => {
      window.db.queryOne = vi.fn().mockResolvedValue({ count: 0 });

      const result = await service.getConflictCount();

      expect(result).toBe(0);
    });
  });

  describe("getQueueItemsByRecord", () => {
    it("should get items by table and record", async () => {
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
