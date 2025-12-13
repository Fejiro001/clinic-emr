import { useAuthStore } from "../store/authStore";
import type { UserRole } from "../types";

/**
 * Hook to check if user has specific role(s)
 *
 * @example
 * const canDelete = useHasRole(['doctor', 'admin']);
 *
 * return (
 *   <button disabled={!canDelete}>
 *     Delete
 *   </button>
 * );
 */
const useHasRole = (roles: UserRole | UserRole[]): boolean => {
  return useAuthStore((state) => state.hasRole(roles));
};

export default useHasRole;
