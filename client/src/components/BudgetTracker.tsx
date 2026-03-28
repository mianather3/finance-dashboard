import { useState } from "react";
import axios from "axios";

interface Budget {
  category: string;
  budget_limit: number;
  month: string;
}

export default function BudgetTracker() {
  const [category, setCategory] = useState<string>("");
  const [limit, setLimit] = useState<string>("");
  const [month, setMonth] = useState<string>("");
  const [message, setMessage] = useState<string>("");

  const handleSubmit = async () => {
    if (!category || !limit || !month) {
      setMessage("Please fill in all fields.");
      return;
    }
    try {
      const res = await axios.post("http://127.0.0.1:5000/budgets", {
        category,
        budget_limit: parseFloat(limit),
        month,
      });
      setMessage(res.data.message);
      setCategory("");
      setLimit("");
      setMonth("");
    } catch (err) {
      setMessage("Failed to save budget.");
    }
  };

  return (
    <div>
      <h2>Budget Tracker</h2>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <input
          placeholder="Category (e.g. Food)"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        />
        <input
          placeholder="Limit (e.g. 200)"
          value={limit}
          onChange={(e) => setLimit(e.target.value)}
          type="number"
        />
        <input
          placeholder="Month (e.g. 2026-03)"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
        <button onClick={handleSubmit}>Save Budget</button>
      </div>
      {message && <p>{message}</p>}
    </div>
  );
}