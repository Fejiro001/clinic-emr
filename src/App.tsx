import { useEffect, useRef, useState } from "react";
import { useActivityTracker, useNetworkStatus } from "./hooks";
import { authService } from "./services/auth";
import { Preloader } from "./components/Common";
import AppRoutes from "./router/AppRoutes";
import { Toaster } from "sonner";
import ConflictResolver from "./components/Common/ConflictResolver";

function App() {
  const [initialized, setInitialized] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);
  const initRef = useRef(false);

  // Track the users activities to manage app timeout
  useActivityTracker();
  // Monitor the network status
  useNetworkStatus();

  useEffect(() => {
    async function init() {
      if (initRef.current) return;
      initRef.current = true;

      await authService.initializeSession();
      setInitialized(true);
    }

    void init();
  }, []);

  useEffect(() => {
    const handleConflicts = () => {
      setShowConflicts(true);
    };

    window.addEventListener("sync-conflicts-detected", handleConflicts);

    return () => {
      window.removeEventListener("sync-conflicts-detected", handleConflicts);
    };
  }, []);

  if (!initialized) {
    return <Preloader />;
  }

  return (
    <>
      <Toaster
        position="top-right"
        closeButton
        richColors
        expand={false}
        duration={4000}
      />
      
      <AppRoutes />

      <ConflictResolver
        isOpen={showConflicts}
        onClose={() => {
          setShowConflicts(false);
        }}
      />
    </>
  );
}

export default App;
