import { Header, Sidebar } from "../components/Layout/index";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex">
      {/* Header */}
      <Sidebar />

      <div className="flex-1 min-w-0">
        <Header />

        {/* Main Content */}
        <main className="layout_main_content ">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
