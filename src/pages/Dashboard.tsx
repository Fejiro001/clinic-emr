import { useSyncStore } from "../store/syncStore";

const Dashboard = () => {
  const syncState = useSyncStore();

  return (
    <div>
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(syncState, null, 2)}
      </pre>
    </div>
  );
};

export default Dashboard;
