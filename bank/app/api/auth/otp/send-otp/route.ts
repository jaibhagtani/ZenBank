// app/api/auth/otp/send-otp/route.ts
import { prisma } from "../../../../../db";
import { redisclient } from "@/redis/redisclient";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const generateOTP = (): string => {
  let OTP = "";
  for (let i = 0; i < 4; i++) {
    OTP += Math.floor(Math.random() * 10);
  }
  return OTP;
};

const sendVerificationEmail = async (email: string, otp: string, username: string): Promise<void> => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `ZenBank <${process.env.EMAIL_ID}>`,
    to: email,
    subject: "Verification Code to Sign Up",
    text: `Hello ${username},\nYour one-time ZenBank code is [${otp}].\nPlease enter this to securely complete your Sign Up.`,
  });
};

export async function POST(req: Request) {
  try {
    const { email, username } = await req.json();

    // console.log(email);
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

    if (!redisclient.isOpen) {
      await redisclient.connect();
    }
    await redisclient.set(email, otp, {
      EX: 60 * 5 // expires in 5 minutes
    });

    // Send email
    await sendVerificationEmail(email, otp, username);

    return NextResponse.json(
      { message: "Verification code has been sent to your email" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in send-otp:", error);
    return NextResponse.json(
      { error: "Something went wrong!" },
      { status: 500 }
    );
  }
}
