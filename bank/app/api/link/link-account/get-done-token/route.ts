"use server"

import { redisclient } from "@/redis/redisclient";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, email, accountNumber, ifsc, userIdAccordingToWallet, link_auth_token, provider } = body;

    const done_token = randomBytes(32).toString("hex");
    const expiresInSeconds = 60 * 5;

    if (!redisclient.isOpen) {
      await redisclient.connect();
    }

    await redisclient.set(
      `Done_token:${done_token}`,
      JSON.stringify({
        phone, email, accountNumber, ifsc, userIdAccordingToWallet, provider
      }),
      {
        EX: expiresInSeconds
      }
    );

    if (link_auth_token) {
      await redisclient.del(`link_auth_token:${link_auth_token}`);
    }

    return NextResponse.json({ done_token }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Something went wrong!" }, { status: 500 });
  }
}
