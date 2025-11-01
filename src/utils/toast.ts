import { toast } from "sonner";

export const showToast = {
  success: (message: string) => {
    toast.success(message);
  },

  error: (message: string) => {
    toast.error(message);
  },

  warning: (message: string) => {
    toast.warning(message);
  },

  info: (message: string) => {
    toast.info(message);
  },

  // Custom toast for conflicts with action button
  conflicts: (count: number, onResolve: () => void) => {
    toast.warning(
      `${String(count)} sync ${count === 1 ? "conflict" : "conflicts"} detected`,
      {
        description: "Click to resolve conflicts now",
        action: {
          label: "Resolve Now",
          onClick: onResolve,
        },
        duration: Infinity, // Infinite duration
      }
    );
  },

  // Sync-related toasts
  syncStarted: () => {
    toast.loading("Syncing...", { id: "sync" });
  },

  syncSuccess: () => {
    toast.success("Sync completed successfully", { id: "sync" });
  },

  syncError: (error: string) => {
    toast.error(`Sync failed: ${error}`, { id: "sync" });
  },

  // Promise-based toast (for async operations)
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages);
  },
};
