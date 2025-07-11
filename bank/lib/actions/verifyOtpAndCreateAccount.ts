"use server";
import { prisma } from "@/db";
import { redisclient } from "@/redis/redisclient";
import bcrypt from "bcrypt";

export async function verifyOtpAndCreateAccount({ phone, email, mpin, otp }:{
  phone: string;
  email: string;
  mpin: string;
  otp: string;
}) {
  try {
    if (!redisclient.isOpen) await redisclient.connect();
    const storedOtp = await redisclient.get(email);

    if (!storedOtp) return { error: "OTP expired or not found." };
    if (storedOtp !== otp) return { error: "Invalid OTP." };

    const hashedPassword = await bcrypt.hash(mpin, 10);

    const userDetails = await prisma.user.findUnique({
      where: {
        email: email, 
        number: phone
      },
      select: {
        id: true
      }
    })
    await prisma.account.create({
      data: {
        userId: Number(userDetails?.id),
        accountNumber: generateAccountNumber(),
        amount: 20000000
      }
    });

    await redisclient.del(email);
    return { success: true, message: "Account created successfully!" };

  } catch (err) {
    console.error(err);
    return { error: "Server error creating account." };
  }
}

function generateAccountNumber(): string {
  const getRandomDigits = (length: number) =>
    Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
  return `${getRandomDigits(4)}-${getRandomDigits(4)}-${getRandomDigits(4)}-${getRandomDigits(4)}`;
}
