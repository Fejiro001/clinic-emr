import { Outlet } from "react-router";
import { Header, Sidebar } from "../components/Layout/index";

const Layout = () => {
  return (
    <div className="min-h-screen flex">
      {/* Header */}
      <Sidebar />

      <div className="bg-gray-100 flex-1">
        <Header />

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
