"use server";

import { prisma } from "@/db";
import bcrypt from "bcrypt";

export async function verifyMpin({
  phone,
  mpin,
  email
}: { phone: string, mpin: string, email: string }) {
  try {
    const user = await prisma.user.findFirst({
      where: { number: phone,
        email: email
       },
       select: {
        MPIN: true
       }
    });

    if (!user) {
      return { success: false, message: "User not found." };
    }

    const isValid = await bcrypt.compare(mpin, user.MPIN);
    if (!isValid) {
      return { success: false, message: "Invalid MPIN." };
    }

    return { success: true, message: "MPIN validated !!" };
  } catch (err) {
    console.error("verifyMpin error:", err);
    return { success: false, message: "Server error." };
  }
}
