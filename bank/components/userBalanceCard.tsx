import React from "react";

export function UserBalanceCard({
  name,
  email,
  number,
  accountNumber,
  balance,
}: {
  name: string;
  email: string;
  number: string;
  accountNumber: string;
  balance: number;
}) {
  return (
    <div className="bg-white rounded-xl shadow p-6 border space-y-2">
      <h2 className="text-xl font-semibold text-gray-800 mb-2">Account Details</h2>
      <ul className="text-gray-700 space-y-1">
        <li><strong>Name:</strong> {name}</li>
        <li><strong>Email:</strong> {email}</li>
        <li><strong>Phone:</strong> {number}</li>
        <li><strong>Account Number:</strong> {accountNumber}</li>
        <li className="mt-2 text-lg font-bold text-green-600">
          Balance: ₹ {balance.toFixed(2)}
        </li>
      </ul>
    </div>
  );
}
