"use server";

import { prisma } from "@/db";

export async function checkUserDetails({
    name,
  phone,
  email,
}: { name: string, phone: string; email: string }) {
  try {
    const existing = await prisma.user.findFirst({
      where: {
        name: name,
        number: phone,
        email: email
      }
    });

    if (existing) {
      return { success: true, message: "User Details Validated !!" };
    }

    return { success: false, message: "Invalid Details !!" };
  } catch (err) {
    console.error("checkUserDetails error:", err);
    return { success: false, message: "Server error." };
  }
}
