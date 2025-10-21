import { useEffect, useState } from "react";
import { supabase } from "./services/supabase";

function App() {
  const [supabaseStatus, setSupabaseStatus] = useState("Testing Supabase...");
  const [sqliteStatus, setSqliteStatus] = useState("Testing SQLite...");

  useEffect(() => {
    // Test Supabase
    const testSupabase = async () => {
      try {
        const { count, error } = await supabase
          .from("patients")
          .select("*", { count: "exact", head: true });

        if (error) throw error;

        const patientCount = count ?? 0;
        setSupabaseStatus(
          `✅ Supabase connected (${String(patientCount)} records)`
        );
      } catch (error) {
        setSupabaseStatus(
          `❌ Supabase error: ${error instanceof Error ? error.message : "Unknown"}`
        );
      }
    };

    // Test SQLite
    const testSQLite = async () => {
      try {
        const result = await window.db.query<{ count: number }>(
          "SELECT COUNT(*) as count FROM patients"
        );
        setSqliteStatus(
          `✅ SQLite connected (${String(result[0]?.count ?? 0)} records)`
        );
      } catch (error) {
        setSqliteStatus(
          `❌ SQLite error: ${error instanceof Error ? error.message : "Unknown"}`
        );
      }
    };

    void testSupabase();
    void testSQLite();
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">Clinic EMR</h1>

        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Cloud Database:
            </p>
            <p className="text-sm text-gray-600">{supabaseStatus}</p>
          </div>

          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm font-semibold text-gray-700 mb-1">
              Local Database:
            </p>
            <p className="text-sm text-gray-600">{sqliteStatus}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
