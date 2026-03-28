import { useState, useEffect } from "react";
import axios from "axios";
import TransactionTable from "./components/TransactionTable";
import CSVUploader from "./components/CSVUploader";
import Dashboard from "./components/Dashboard";
import BudgetTracker from "./components/BudgetTracker";

interface Summary {
  total_income: number;
  total_expenses: number;
  average_expense: number;
  top_category: string;
  net_savings: number;
}

export default function App() {
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [summary, setSummary] = useState<Summary | null>(null);

  const handleUploadSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/summary").then((res) => {
      setSummary(res.data);
    });
  }, [refreshKey]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>💰 Personal Finance Dashboard</h1>
      <hr />
      <CSVUploader onUploadSuccess={handleUploadSuccess} />
      <hr />
      {summary && (
        <div>
          <h2>Monthly Summary</h2>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            <div style={{ background: "#e8f5e9", padding: "15px", borderRadius: "8px" }}>
              <h3>Total Income</h3>
              <p style={{ color: "green", fontSize: "24px" }}>${summary.total_income}</p>
            </div>
            <div style={{ background: "#ffebee", padding: "15px", borderRadius: "8px" }}>
              <h3>Total Expenses</h3>
              <p style={{ color: "red", fontSize: "24px" }}>${summary.total_expenses}</p>
            </div>
            <div style={{ background: "#e3f2fd", padding: "15px", borderRadius: "8px" }}>
              <h3>Net Savings</h3>
              <p style={{ color: "blue", fontSize: "24px" }}>${summary.net_savings}</p>
            </div>
            <div style={{ background: "#fff3e0", padding: "15px", borderRadius: "8px" }}>
              <h3>Avg Expense</h3>
              <p style={{ color: "orange", fontSize: "24px" }}>${summary.average_expense}</p>
            </div>
            <div style={{ background: "#f3e5f5", padding: "15px", borderRadius: "8px" }}>
              <h3>Top Category</h3>
              <p style={{ color: "purple", fontSize: "24px" }}>{summary.top_category}</p>
            </div>
          </div>
        </div>
      )}
      <hr />
      <Dashboard key={refreshKey} />
      <hr />
      <BudgetTracker />
      <hr />
      <TransactionTable key={refreshKey} />
    </div>
  );
}