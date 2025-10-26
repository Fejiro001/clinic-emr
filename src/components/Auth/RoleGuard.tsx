import { useAuthStore } from "../../store/authStore";
import type { UserRole } from "../../types";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallback?: React.ReactNode;
  hideIfUnauthorized?: boolean;
}
/**
 * Component that conditionally renders children based on user role
 *
 * @example
 * Only show to doctors and admins
 * <RoleGuard allowedRoles={['doctor', 'admin']}>
 *   <button>Delete Patient</button>
 * </RoleGuard>
 *
 * @example
 * Show fallback if unauthorized
 * <RoleGuard
 *   allowedRoles={['admin']}
 *   fallback={<p>Admin access required</p>}
 * >
 *   <AdminPanel />
 * </RoleGuard>
 */
const RoleGuard = ({
  children,
  allowedRoles,
  fallback = null,
  hideIfUnauthorized = true,
}: RoleGuardProps) => {
  const hasRole = useAuthStore((state) => state.hasRole(allowedRoles));

  if (!hasRole) {
    return hideIfUnauthorized ? null : <>{fallback}</>;
  }

  return <>{children}</>;
};

export default RoleGuard;