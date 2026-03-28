import { useState } from "react";
import TransactionTable from "./components/TransactionTable";
import CSVUploader from "./components/CSVUploader";
import Dashboard from "./components/Dashboard";

export default function App() {
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const handleUploadSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>💰 Personal Finance Dashboard</h1>
      <hr />
      <CSVUploader onUploadSuccess={handleUploadSuccess} />
      <hr />
      <Dashboard key={refreshKey} />
      <hr />
      <TransactionTable key={refreshKey} />
    </div>
  );
}