import { redisclient } from "@/redis/redisclient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, otp } = body;

  try {
    
    if(!redisclient.isOpen)
    {
      await redisclient.connect();
    }

    const redisOTP = await redisclient.get(email);

    if (otp === redisOTP) {
      await redisclient.del(email);
      return NextResponse.json({
        msg: `OTP Verified Successfully!!`
      });
    }

    return NextResponse.json(
      { msg: "Invalid OTP" },
      { status: 400 }
    );

  } catch (error) {
    console.error("OTP verification error:", error);

    return NextResponse.json(
      { msg: "Something went wrong!" },
      { status: 500 }
    );
  }
}
