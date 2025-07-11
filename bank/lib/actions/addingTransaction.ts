"use server";

import { redisclient } from "@/redis/redisclient";

export async function AddingTransaction({
  userId,
  amount,
  walletWebhookURL,
  bankToken,
  userIdAccordingToWallet,
  walletToken,
  accountNumber,
  provider
}: {
  userId?: number;
  amount: string;
  walletWebhookURL: string;
  bankToken: string;
  userIdAccordingToWallet?: number;
  walletToken: string;
  accountNumber: string;
  provider: string;
}) {
  try {
    if (!userId || !amount || !walletWebhookURL || !bankToken || !walletToken || !amount || !accountNumber || !provider) {
      return { success: false, message: "Missing required fields." };
    }

    const txnKey = `txn:${bankToken}`;

    const txnPayload = {
      userId: userId.toString(),
      amount,
      bankToken,
      walletToken,
      userIdAccordingToWallet : userIdAccordingToWallet?.toString(),
      type: "deposit",
      webhookURL: walletWebhookURL,
      createdAt: new Date().toISOString(),
      accountNumber: accountNumber,
      wallet: provider
    };

    await redisclient.set(txnKey, JSON.stringify(txnPayload), {
      EX: 600, // 10 minutes
    });
    
    // can push whole payLoad to queue too, 
    // but this is better, because memory optimisation, expiry
    await redisclient.RPUSH("wallet:transactions", bankToken);

    return {
      success: true,
      message: "Transaction queued successfully.",
    };
  } catch (err) {
    console.error("AddingTransaction error:", err);
    return {
      success: false,
      message: "Server error while queuing transaction.",
    };
  }
}
