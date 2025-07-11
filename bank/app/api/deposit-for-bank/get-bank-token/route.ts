import { prisma } from "@/db";
import { redisclient } from "@/redis/redisclient";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": `${process.env.NEXT_PUBLIC_ZENPAY_URL}`,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { accessToken, walletToken, amount, provider } = body;

    if (!accessToken || !walletToken || !amount || amount <= 0) {
      return new Response(JSON.stringify({ msg: "Invalid request body" }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    const walletAccount = await prisma.wallet.findFirst({
      where: { 
        accessToken: accessToken,
      },
      select: {
        account: {
          select: {
            amount: true,
            id: true
          }
        }
      }
    });

    console.log(walletAccount)
    if (!walletAccount) {
      return new Response(JSON.stringify({ msg: "Account not found" }), {
        status: 404,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      });
    }

    if (walletAccount.account.amount < amount) {
      return new Response(
        JSON.stringify({ msg: "Insufficient balance in Account" }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    const bankToken = crypto.randomUUID();

    const redisKey = `bankToken:${bankToken}`;
    const redisValue = JSON.stringify({
      bankToken,
      walletToken,
      amount,
      accessToken,
      status: "initiated",
    });

    await redisclient.set(redisKey, redisValue);
    await redisclient.expire(redisKey, 600); // 10 minutes

    await prisma.withdrawFromBankTransaction.create({
      data: {
        walletToken: walletToken,
        bankToken: bankToken,
        status: "PROCESSING",
        amount: amount,
        accountId: walletAccount.account.id,
        provider: provider
      }
    })
    return new Response(
      JSON.stringify({ msg: "Deposit Initiation Accepted", bankToken }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("Bank deposit error:", err);
    return new Response(
      JSON.stringify({ msg: "Internal Server Error", error: String(err) }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
}
