import { useState } from "react";

function App() {
  const [status] = useState("Testing...");

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
