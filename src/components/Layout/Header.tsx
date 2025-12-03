import { Menu } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const { user } = useAuthStore();
  const usersRole =
    String(user?.role.charAt(0).toUpperCase()) + String(user?.role.slice(1));
  const date = new Date();
  const today = new Intl.DateTimeFormat("en-NG", {
    dateStyle: "long",
  }).format(date);

  const toggleSidebar = () => {
    setIsOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current) {
        if (!sidebarRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      {/* SIDEBAR OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 transition-opacity duration-300 md:hidden"
          onClick={() => {
            setIsOpen(false);
          }}
        />
      )}

      <header className="header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-start items-center gap-4">
          <div className="md:hidden" ref={sidebarRef}>
            <button
              onClick={toggleSidebar}
              title="Sidebar"
              type="button"
              className="flex rounded-md p-2 hover:bg-primary-500/10"
            >
              <Menu />
            </button>

            {/* Sidebar */}
            <div
              className={` ${
                isOpen ? "translate-x-0" : "-translate-x-full"
              } fixed inset-0 z-30 h-screen supports-[height:100dvh]:h-dvh w-64 max-w-full transition-transform duration-500 md:relative md:inset-auto md:w-auto md:translate-x-0`}
            >
              <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
            </div>
          </div>

          <div className="w-full flex justify-between items-center gap-4 py-4">
            <div className="text-left">
              <p className="px-3 py-1 bg-primary-100 text-primary-800 text-sm font-medium rounded-full w-fit">
                {usersRole}
              </p>
              <p className="font-medium text-text-primary text-lg">
                Welcome, {user?.full_name}
              </p>
            </div>

            <div className="text-right">
              <p className="font-light">Today</p>
              <p className="font-bold text-text-primary">{today}</p>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
