import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import {
  ClipboardList,
  Home,
  Hospital,
  LogOut,
  Stethoscope,
  User,
  UserCog,
  Users,
} from "lucide-react";
import { LogoutModal, RoleGuard } from "../Auth";
import type { UserRole } from "../../types";
import { SyncStatusIndicator } from "../Common";

const navItems = [
  {
    path: "/",
    label: "Dashboard",
    icon: Home,
    roles: ["doctor", "secretary", "nurse", "admin"],
  },
  {
    path: "/patients",
    label: "Patients",
    icon: Users,
    roles: ["doctor", "secretary", "nurse", "admin"],
  },
  {
    path: "/patients/inpatients",
    label: "Inpatient",
    icon: Hospital,
    roles: ["doctor", "nurse", "admin"],
  },
  {
    path: "/patients/outpatients",
    label: "Outpatient",
    icon: Stethoscope,
    roles: ["doctor", "secretary", "admin"],
  },
  {
    path: "/audit-logs",
    label: "Audit Logs",
    icon: ClipboardList,
    roles: ["admin"],
  },
  {
    path: "/users",
    label: "Users",
    icon: UserCog,
    roles: ["admin"],
  },
  {
    path: "/profile",
    label: "Profile",
    icon: User,
    roles: ["doctor", "secretary", "nurse", "admin"],
  },
];

const Sidebar = ({
  isOpen,
  setIsOpen,
}: {
  isOpen?: boolean;
  setIsOpen?: (arg0: boolean) => void;
}) => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  if (!isOpen && !isDesktop) return null;

  return (
    <>
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <LogoutModal setShowLogoutModal={setShowLogoutModal} />
      )}

      <aside className="sidebar">
        <div className="hide_scrollbar h-full min-h-screen overflow-y-auto flex flex-col">
          <div className="border-b border-b-gray-400 flex items-center gap-2 px-4 py-6">
            <h1 className="text-xl font-bold">Celian Clinic EMR</h1>
          </div>

          <nav className="overflow-y-auto">
            <ul>
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <RoleGuard
                    allowedRoles={item.roles as UserRole[]}
                    key={item.path}
                  >
                    <li>
                      <Link
                        to={item.path}
                        onClick={() => {
                          if (setIsOpen) setIsOpen(false);
                        }}
                        title={item.label}
                        className={`sidebar_links ${location.pathname === item.path ? "bg-primary-800 text-white" : ""}`}
                      >
                        <Icon size={20} />
                        <span>{item.label}</span>
                      </Link>
                    </li>
                  </RoleGuard>
                );
              })}
            </ul>
          </nav>

          <div className="mt-auto inset-x-0 bottom-0 w-full border-t border-slate-400 pt-4 space-y-2">
            {/* Online status indicator */}
            <SyncStatusIndicator />

            <div className="p-3">
              <button
                onClick={() => {
                  setShowLogoutModal(true);
                }}
                className="logout"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
