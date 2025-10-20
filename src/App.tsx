import { useEffect, useState } from "react";
import { supabase } from "./services/supabase";

function App() {
  const [status, setStatus] = useState("Testing...");

  useEffect(() => {
    const testConnection = async () => {
      try {
        const { count, error } = await supabase
          .from("patients")
          .select("*", { count: "exact", head: true });

        if (error) throw error;

        const patientCount = count ?? 0;
        setStatus(
          `Supabase connected! Patients table ready (${String(patientCount)}) records.`
        );
      } catch (err) {
        setStatus(
          `Unexpected error: ${err instanceof Error ? err.message : "Unknown error"}`
        );
      }
    };

    void testConnection();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Clinic EMR</h1>
        <p className="text-lg text-gray-600">{status}</p>
      </div>
    </div>
  );
}

export default App;
