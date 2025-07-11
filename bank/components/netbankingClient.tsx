"use client";
import React, { useState } from "react";
import { SendNetbankingCard } from "./sendMoneyNetBanking";

export default function NetBankingClient({ balance }: { balance: number }) {
  const [activeTab, setActiveTab] = useState("deposit");

  return (
    <div>
      <div className="flex space-x-4 mb-8">
        {["deposit", "withdraw"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 rounded-full font-semibold shadow-sm transition-all duration-200 ${
              activeTab === tab
                ? "bg-blue-700 text-white"
                : "bg-white text-blue-700 border border-blue-500 hover:bg-blue-50"
            }`}
          >
            {tab === "deposit" ? "Deposit" : "Withdraw"}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-8">
          <SendNetbankingCard
            title={activeTab === "deposit" ? "Pay to Wallet" : "Withdraw from Wallet"}
            buttonThing=""
          />
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Your Balances
            </h3>
            <ul className="space-y-2 text-gray-700 text-lg">
              <li className="flex justify-between font-semibold">
                <span>Total Balance</span>
                <span className="text-blue-800">
                  {(balance / 100).toFixed(2)} INR
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
