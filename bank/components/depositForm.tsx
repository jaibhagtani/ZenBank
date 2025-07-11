"use client";

import { useState } from "react";

export function DepositForm({ userId }: { userId: number }) {
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/deposit", {
        method: "POST",
        body: JSON.stringify({ userId, amount, remarks }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        throw new Error("Failed to deposit");
      }

      alert("Deposit successful!");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Error during deposit.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="userId" value={userId} />

      <div>
        <label className="block text-gray-700 mb-1">Amount (INR)</label>
        <input
          type="number"
          min="1"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          placeholder="Enter amount"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-gray-700 mb-1">Remarks</label>
        <input
          type="text"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
          placeholder="Optional note"
          disabled={loading}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-2 rounded-lg font-semibold text-white transition ${
          loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Processing..." : "Deposit Now"}
      </button>
    </form>
  );
}
