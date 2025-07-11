"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { InputOTPGroup } from "./inputotpgroup copy";
import { Button } from "./button";
import { Card } from "./card";
import { AddingTransaction } from "@/lib/actions/addingTransaction";
import { getAccountDetails, getDetailsAccordingToBankToken } from "@/lib/actions/getDetailsAccordingToBankToken";
import { clearRedisEntrybyRedisKey } from "@/lib/actions/clearRedisEntrybyRedisKey";
// not in client component
// import dotenv from "dotenv";
// dotenv.config();
interface ConfirmDepositProps {
  accountNumber: string;
  ifsc: string;
  bankToken:string;
  amount: number;
  redisKey: string;
  toWallet: string;
  access_token: string;
}

export function ConfirmDeposit({ accountNumber, ifsc, bankToken, amount, redisKey, toWallet, access_token }: ConfirmDepositProps) {
  const [mpin, setMpin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();

  const validateMpin = async () => {
    const res = await fetch("/api/mpin/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Mpin: mpin,
        email: session.data?.user?.email,
      }),
    });

    return res.json();
  };

  const handleDepositToWallet = async () => {
    try {
      
      const accountDetails = await getAccountDetails(accountNumber, ifsc, access_token); 
      const detailsFromBankToken = await getDetailsAccordingToBankToken(bankToken)
      
      const res = await AddingTransaction({userId: accountDetails?.userId, amount: (detailsFromBankToken.amount).toString(), 
        bankToken: detailsFromBankToken.bankToken, walletToken: detailsFromBankToken.walletToken, 
        userIdAccordingToWallet: accountDetails?.linkedWallets[0].walletUserId || 0, walletWebhookURL: `${process.env.BANK_WEBHOOK_URL_ZENPAY}/zenbankWebhook`,
      accountNumber: accountNumber, provider: toWallet})


      if (!res.success) {
        alert(res?.message || "Deposit failed.");
      } else {
        alert("Deposit Processing !!");
        clearRedisEntrybyRedisKey(redisKey);
        window.location.href = `${process.env.NEXT_PUBLIC_ZENPAY_URL}/transfer/deposit`
      }
    } catch (error) {
      console.error("Deposit error:", error);
      alert("An unexpected error occurred during deposit.");
    }
  };

  return (
    <div className="mx-2 sm:mx-5 mt-8">
      <Card title="Confirm Deposit">
        <div className="px-2 sm:px-4">
          <div className="mb-4 mt-2">
            <label className="block text-sm font-semibold mb-1">Deposit to</label>
            <input
              type="text"
              value={toWallet}
              readOnly
              className="w-full p-2 border rounded-lg bg-gray-100 text-sm font-mono"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">Account Number</label>
            <input
              type="text"
              value={accountNumber}
              readOnly
              className="w-full p-2 border rounded-lg bg-gray-100 text-sm font-mono"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">IFSC</label>
            <input
              type="text"
              value={ifsc}
              readOnly
              className="w-full p-2 border rounded-lg bg-gray-100 text-sm font-mono"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-1">Amount</label>
            <input
              type="text"
              value={(amount/100).toFixed(2)}
              readOnly
              className="w-full p-2 border rounded-lg bg-gray-100 text-sm font-mono"
            />
          </div>

          <div className="text-sm font-bold border-b py-2">Enter MPIN</div>
          <div className="py-3 flex justify-center">
            <InputOTPGroup type="password" onChangeFunc={setMpin} />
          </div>
          <div className="flex justify-center pt-2">
            <Button
              onClickFunc={async () => {
                setIsLoading(true);
                const res = await validateMpin();
                if (res.msg === "Valid User") {
                  await handleDepositToWallet();
                } else {
                  alert("Invalid MPIN");
                }
                setIsLoading(false);
              }}
              state={isLoading}
            >
              {isLoading ? "Processing..." : "Confirm Deposit"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
