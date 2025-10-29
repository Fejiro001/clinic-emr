import { useAuthStore } from "../../store/authStore";

const Header = () => {
  const { user } = useAuthStore();
  const usersRole =
    String(user?.role.charAt(0).toUpperCase()) + String(user?.role.slice(1));
  const date = new Date();
  const today = new Intl.DateTimeFormat("en-NG", {
    dateStyle: "long",
  }).format(date);

  return (
    <header className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
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
  );
};

export default Header;
