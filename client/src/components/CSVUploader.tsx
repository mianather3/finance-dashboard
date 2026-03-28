import { useState } from "react";
import axios from "axios";

interface Props {
  onUploadSuccess: () => void;
}

export default function CSVUploader({ onUploadSuccess }: Props) {
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const res = await axios.post("http://127.0.0.1:5000/upload", formData);
      setMessage(res.data.message);
      onUploadSuccess();
    } catch (err) {
      setMessage("Upload failed. Check your CSV format.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Upload Transactions</h2>
      <input type="file" accept=".csv" onChange={handleUpload} />
      {loading && <p>Uploading...</p>}
      {message && <p>{message}</p>}
    </div>
  );
}