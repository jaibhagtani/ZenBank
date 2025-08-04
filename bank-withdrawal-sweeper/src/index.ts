import { createClient } from "redis";
import { prisma } from "./db";
import express from "express"; // fixed ESModule import

const app = express();
const PORT = process.env.PORT;

export const redisclient = createClient({
  url: "rediss://default:ATKqAAIjcDFjODM2YjJmMTkwYjY0YjNhOTUyYThhMTE4NmZlOTA5MHAxMA@inspired-wahoo-12970.upstash.io:6379",
  socket: {
    tls: true,
    rejectUnauthorized: false,
    host: "inspired-wahoo-12970.upstash.io",
  },
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
    // console.log(`[WEBHOOK] Response from wallet:`, data);

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
    // Phase 1: Validate & Record INTENT (do not deduct)
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
      const job = await redisclient.lPop("withdrawUserQueue:transactions");

      if (!job) {
        await sleep(100);
        continue;
      }

      const txnKey = `txn:${job}`;
      const jobData = await redisclient.get(txnKey);

      if (typeof jobData === "string") {
        const { userId, ...rest } = JSON.parse(jobData) as TransactionPayload;
        const lockKey = `lock:user:${userId}`;
        const lock = await redisclient.set(lockKey, "locked", { NX: true, EX: 10 });
  
        if (!lock) {
          await redisclient.RPUSH("wallet:transactions", job);
          await sleep(100);
          continue;
        }
  
        try {
          const result = await handleTransaction(userId, rest, txnKey);
          // console.log("[RESULT]", result);
  
          if (result !== "Captured") {
            console.warn(`[RETRY] Re-pushing txn:${rest.bankToken}`);
            await redisclient.RPUSH("wallet:transactions", job);
          }
        } finally {
          await redisclient.del(lockKey);
        }
      } else {
        await sleep(100);
      }
    }
    finally {
      console.error("error occured");
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
