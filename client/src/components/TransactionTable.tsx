import { useEffect, useState } from "react";
import axios from "axios";

interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: string;
  category: string;
  type: "income" | "expense";
}

export default function TransactionTable() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    axios.get("http://127.0.0.1:5000/transactions").then((res) => {
      setTransactions(res.data);
    });
  }, []);

  return (
    <div>
      <h2>Transactions</h2>
      <table border={1} cellPadding={8} style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id} style={{ color: t.type === "income" ? "green" : "red" }}>
              <td>{new Date(t.date).toLocaleDateString()}</td>
              <td>{t.description}</td>
              <td>{t.category}</td>
              <td>${parseFloat(t.amount).toFixed(2)}</td>
              <td>{t.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}