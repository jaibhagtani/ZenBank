import express, { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "./db";

const app = express();
const port = process.env.PORT;
app.use(express.json());

const webhookSchema = z.object({
  withdrawToken: z.string(),
  accessToken: z.string(),
  amount: z.number(),
  provider: z.string()
});

app.post("/zenpayWebhook", async (req: Request, res: Response): Promise<void> => {
  const parsed = webhookSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ msg: "Invalid payload" });
    return;
  }

  
  const { withdrawToken, accessToken, amount, provider } = parsed.data;

  try {
    
    const account = await prisma.wallet.findUnique({
      where: {
        accessToken: accessToken
      },
      select: {
        account: true,
        accountId: true
      }
    }) 
    if(!account)
    {
      res.status(400).json({ msg: "Error in finding Account" });
      return;
    }
    await prisma.depositToBankTransaction.upsert({
      where: { withdrawToken },
      update: {},
      create: {
        withdrawToken,
        provider,
        status: "PROCESSING",
        accountId: account.accountId,
        amount: amount
      }
    });

    await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { accessToken },
        data: {
          account: {
            update: {
              amount: {
                increment: amount
              }
            }
          }
        }
      });

      await tx.depositToBankTransaction.updateMany({
        where: {
          withdrawToken,
          status: {
            in: ["PROCESSING", "FAILURE"]
          }
        },
        data: {
          status: "SUCCESS"
        }
      });
    });

    res.status(200).json({ msg: "Captured" });
  } catch (e) {
    console.error("[zenpayWebhook ERROR]", e);
    res.status(411).json({ msg: "Error while processing webhook" });
  }
});

app.listen(port, () => {
  // console.log(`ZenPay webhook server running on port ${port}`);
});
