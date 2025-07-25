import { redisclient } from "@/redis/redisclient";
import { prisma } from "../../../../db";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const generateOTP = (): string => {
  let OTP = "";
  for (let i = 0; i < 4; i++) {
    OTP += Math.floor(Math.random() * 10);
  }
  return OTP;
};

const sendVerificationEmail = async (
  email: string,
  otp: string,
  username: string
): Promise<string> => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ID,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: `ZenPay Payments <${process.env.EMAIL_ID}>`,
      to: email,
      subject: "Verification Code to Sign Up",
      text: `Hello ${username},

Your one-time ZenBank code is [${otp}].
Please enter this to securely complete set MPIN.

For your safety, never share this code.
Thank you for trusting ZenBank — seamless payments, made simple.

ZenBank | Safe. Fast. Effortless.`,
    });

    if(!redisclient.isOpen)
    {
      await redisclient.connect();
    }

    await redisclient.set(email, otp, {
      EX: 300, // 5 minutes expiry
    });

    return info.messageId;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Error sending verification email");
  }
};

export async function POST(req: Request) {
  try {
    const { email, username } = await req.json();

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const otp = generateOTP();
    await sendVerificationEmail(email, otp, username);

    return NextResponse.json({
      message: "Verification code has been sent to your email",
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Something went wrong!" },
      { status: 500 }
    );
  }
}
