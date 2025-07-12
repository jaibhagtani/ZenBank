"use server"
import { prisma } from "@/db";
import { redisclient } from "@/redis/redisclient";
import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import dotenv from "dotenv";
dotenv.config();

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders()
  });
}

export async function POST(req: Request) {
  // const origin = req.headers.get("origin");

  // console.log(origin)

  // if (origin !== `${process.env.NEXT_PUBLIC_ZENPAY_URL}`) {
  //   return new NextResponse(JSON.stringify({ error: "CORS: Origin not allowed" }), {
  //     status: 403,
  //     headers: corsHeaders()
  //   });
  // }

  // if (!referer?.startsWith(`${process.env.NEXT_PUBLIC_ZENPAY_URL}`)) {
  //   return new NextResponse(JSON.stringify({ error: "Invalid referer path" }), {
  //     status: 403,
  //     headers: corsHeaders()
  //   });
  // }

  try {
    const body = await req.json();
    const { userIdAccordingToWallet, phoneNumber, accountNumber, ifsc, email, call_back_URL, provider } = body;

    const isExistingUser = await prisma.user.findFirst({
      where: {
        email: email,
        number: phoneNumber,
      },
      include: {
        accounts: true
      }
    });

    if (!isExistingUser || !isExistingUser.accounts.some(acc =>
        acc.accountNumber === accountNumber && acc.ifsc === ifsc
      )) {
      return new NextResponse(
        JSON.stringify({ msg: "User doesn't have this account or incorrect details!", token: null }),
        { status: 400, 
          // headers: corsHeaders()
        }
      );
    }


    const token = randomBytes(32).toString("hex");
    const expiresInSeconds = 60 * 5;

    if (!redisclient.isOpen) await redisclient.connect();

    await redisclient.set(
      `Link_auth_token:${token}`,
      JSON.stringify({
        userIdAccordingToWallet,
        phoneNumber,
        email,
        call_back_URL,
        accountNumber,
        provider
      }),
      { EX: expiresInSeconds }
    );

    return new NextResponse(
      JSON.stringify({ msg: "Correct details", token: token }),
      { status: 200, 
        headers: corsHeaders()
      }
    );

  } catch (err) {
    console.error(err);
    return new NextResponse(
      JSON.stringify({ error: "Something went wrong!" }),
      { status: 500, 
        headers: corsHeaders()
      }
    );
  }
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": `*`,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    // "Access-Control-Allow-Credentials": "true"
  };
}
