import { useState } from "react";
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
import { LogoutModal, RoleGuard } from "../Auth/index.js";
import type { UserRole } from "../../types";

const navItems = [
  {
    path: "/dashboard",
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
    path: "/inpatient",
    label: "Inpatient",
    icon: Hospital,
    roles: ["doctor", "nurse", "admin"],
  },
  {
    path: "/outpatient",
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

const Sidebar = () => {
  const location = useLocation();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <>
      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <LogoutModal setShowLogoutModal={setShowLogoutModal} />
      )}

      <aside className="sidebar">
        <div className="border-b border-b-gray-400 flex items-center gap-2 px-4 py-6">
          <h1 className="text-xl font-bold">Clinic EMR</h1>
        </div>

        <nav>
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
                      className={`sidebar_links ${location.pathname === item.path ? "bg-primary-800" : ""}`}
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

        <div className="mt-auto absolute inset-x-0 bottom-0 w-full border-t border-slate-400">
          {/* Online status indicator */}
          <div></div>
          <button
            onClick={() => {
              setShowLogoutModal(true);
            }}
            className="sidebar_links"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
