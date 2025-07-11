import { prisma } from "@/db";
import { redisclient } from "@/redis/redisclient";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

const generateOTP = (): string => {
  let OTP = "";
  for (let i = 0; i < 4; i++) {
    OTP += Math.floor(Math.random() * 10);
  }
  return OTP;
};

const sendOTPEmail = async (email: string, otp: string) => {
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
    subject: "Your OTP for MPIN verification",
    text: `Hello,

Your one-time OTP is [${otp}].
It will expire in 5 minutes.

Please do not share this with anyone.

- ZenBank Team`,
  });
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { phone, mpin, email } = body;

    if (!phone || !mpin || !email) {
      return new Response(JSON.stringify({ msg: "Missing required fields." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        number: phone,
        email: email,
      },
      select: {
        MPIN: true
      }
    });

    if (!user) {
      return new Response(JSON.stringify({ msg: "Invalid phone/email." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

  if (!user || !user.MPIN || !(await bcrypt.compare(mpin, user.MPIN))) {
  return new Response(JSON.stringify({ msg: "Invalid MPIN." }), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

    const otp = generateOTP();
    // console.log(otp)
    if (!redisclient.isOpen) {
      await redisclient.connect();
    }

    await redisclient.set(`otp:${phone}`, otp, { EX: 300 });

    // console.log(`Generated OTP for ${phone}: ${otp}`);

    await sendOTPEmail(email, otp);

    return new Response(JSON.stringify({ msg: "OTP sent to your email." }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ msg: "Failed to process request." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
