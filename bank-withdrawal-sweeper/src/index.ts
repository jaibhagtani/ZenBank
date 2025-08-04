import { createClient } from "redis";
import { prisma } from "./db";
import express from "express"; // fixed ESModule import

const app = express();
const PORT = process.env.PORT;

export const redisclient = createClient({
  url: process.env.REDIS_URL
});


interface TransactionPayload {
  userId: string;
  amount: string;
  webhookURL: string;
  type: string;
  createdAt: string;
  bankToken: string;
  walletToken: string;
  userIdAccordingToWallet: string;
  accountNumber: string;
  wallet: string;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function sendWebhook(url: string, payload: any): Promise<"Captured" | "Retry" | "Error"> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    return data?.msg === "Captured" ? "Captured" : "Retry";
  } catch (error) {
    console.error(`[WEBHOOK ERROR]`, error);
    return "Error";
  }
}

async function handleTransaction(userId: string, txn: Omit<TransactionPayload, "userId">, txnKey: string): Promise<"Captured" | "Retry" | "Error"> {
  const amount = Number(txn.amount);
  const userIdInt = Number(userId);
  const accountNumber = txn.accountNumber;
  const userIdAccordingToWalletInt = Number(txn.userIdAccordingToWallet);

  let accountId: number;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT * FROM "Account" WHERE "accountNumber" = ${accountNumber} FOR UPDATE`;

      const account = await tx.account.findFirstOrThrow({
        where: {
          accountNumber,
          userId: userIdInt,
          linkedWallets: {
            some: { walletUserId: userIdAccordingToWalletInt }
          }
        }
      });

      accountId = account.id;

      await tx.withdrawFromBankTransaction.upsert({
        where: { bankToken: txn.bankToken },
        update: { status: "PROCESSING" },
        create: {
          accountId: account.id,
          amount,
          status: "PROCESSING",
          bankToken: txn.bankToken,
          walletToken: txn.walletToken,
          provider: txn.wallet
        }
      });
    });

    const webhookResult = await sendWebhook(txn.webhookURL, {
      walletToken: txn.walletToken,
      user_indentifier: txn.userIdAccordingToWallet,
      amount,
      status: "SUCCESS"
    });

    if (webhookResult === "Captured") {
      await prisma.$transaction(async (tx) => {
        await tx.account.update({
          where: { id: accountId },
          data: {
            amount: {
              decrement: amount
            }
          }
        });

        await tx.withdrawFromBankTransaction.update({
          where: { bankToken: txn.bankToken },
          data: { status: "SUCCESS" }
        });
      });

      await redisclient.del(txnKey);
      return "Captured";
    } else {
      await prisma.withdrawFromBankTransaction.update({
        where: { bankToken: txn.bankToken },
        data: { status: "FAILURE" }
      });
      return "Retry";
    }
  } catch (err) {
    console.error("[ERROR] Failed to handle transaction:", err);
    return "Retry";
  }
}


async function startWorkerLoop() {
  // console.log("Worker started and polling Redis queue");
  while (true) {
    try {
      if (!redisclient.isOpen) {
        await redisclient.connect();
      }

      const result = await redisclient.blPop(["withdrawUserQueue:transactions"], 0);

      if (!result) {
        continue;
      }

      const { element: job } = result;
      const txnKey = `txn:${job}`;
      const jobData = await redisclient.get(txnKey);

      if (typeof jobData !== "string") {
        await sleep(100);
        continue;
      }

      const { userId, ...rest } = JSON.parse(jobData) as TransactionPayload;
      const lockKey = `lock:user:${userId}`;
      const lock = await redisclient.set(lockKey, "locked", { NX: true, EX: 10 });

      if (!lock) {
        console.log(`[LOCK] Job for user ${userId} is locked, skipping for now`);
        await sleep(100); // wait before continuing
        continue;
      }

      try {
        const result = await handleTransaction(userId, rest, txnKey);

        if (result !== "Captured") {
          console.warn(`[RETRY] Transaction ${rest.bankToken} failed, re-queueing`);
          await redisclient.rPush("withdrawUserQueue:transactions", job);
        } else {
          await redisclient.del(txnKey);
        }
      } finally {
        await redisclient.del(lockKey);
      }
    } catch (err) {
      console.error("[WORKER ERROR]", err);
      await sleep(1000);
    }
  }

}

app.get("/", (_, res) => {
  res.send("ZenBank Worker is running");
});

app.get("/health", async (_, res) => {
  try {
    await redisclient.ping();
    res.send("OK");
  } catch {
    res.status(500).send("Redis unavailable");
  }
});

app.listen(PORT, () => {
  // console.log(`🌐 Worker service running at http://localhost:${PORT}`);
  startWorkerLoop();
});
