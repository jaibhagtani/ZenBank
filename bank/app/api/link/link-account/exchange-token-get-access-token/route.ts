import { prisma } from "@/db";
import { redisclient } from "@/redis/redisclient";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

// helper to build JSON with CORS
function corsJsonResponse(body: any, status: number = 200) {
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": `https://user-zenpay-payments.vercel.app`,
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

// explicitly handle preflight
export async function OPTIONS(req: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": `https://user-zenpay-payments.vercel.app`,
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    },
  });
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (origin !== `https://user-zenpay-payments.vercel.app`) {
    return corsJsonResponse({ msg: "CORS: Not allowed." }, 403);
  }

  const { done_token } = await req.json();
  if (!done_token) {
    return corsJsonResponse({ msg: "Missing done_token." }, 400);
  }

  try {
    if (!redisclient.isOpen) {
      await redisclient.connect();
    }

    const doneDataString = await redisclient.get(`Done_token:${done_token}`);
    if (!doneDataString) {
      return corsJsonResponse({ msg: "Invalid or expired done_token." }, 400);
    }

    const doneData = JSON.parse(doneDataString);
    const { userIdAccordingToWallet, accountNumber, ifsc, email, phone, provider } = doneData;

    const user = await prisma.user.findFirst({
      where: { email, number: phone },
    });

    if (!user) {
      return corsJsonResponse({ msg: "User not found." }, 404);
    }

    const access_token = randomBytes(64).toString("hex");
    // console.log(userIdAccordingToWallet)
    if (!userIdAccordingToWallet) {
      return corsJsonResponse({ msg: "wallet User not found." }, 404);
    }
    // accountNumber, ifsc, user.id
    // update userIdAccordingToWallet, access_token
    const accountDetails = await prisma.account.findUnique({
      where: {
        accountNumber: accountNumber,
        ifsc: ifsc,
        userId: user.id
      }
    })

    if(accountDetails)
    {
      await prisma.$transaction(async (tx) => {
        await tx.wallet.create({
          data: {
            accountId: accountDetails?.id,
            name: provider,
            accessToken: access_token,
            walletUserId: (userIdAccordingToWallet),
          }
        })
        
      })

    }

    await redisclient.del(`Done_token:${done_token}`);

    return corsJsonResponse({
      msg: "Account linked successfully!",
      access_token,
    });
  } catch (error) {
    console.error("Error in linking:", error);
    return corsJsonResponse({ msg: "Something went wrong." }, 500);
  }
}
