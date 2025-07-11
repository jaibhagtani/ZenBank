import { prisma } from "@/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, accountNumber, ifsc } = body;

    if (!name || !email || !phone || !accountNumber || !ifsc) {
      return new Response(JSON.stringify({ msg: "Missing data." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const user = await prisma.user.findFirst({
      where: { name, email, number: phone },
      include: { accounts: true }, // OR `account: true` based on your model
    });

    if (!user) {
      return new Response(JSON.stringify({ msg: "User not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const hasMatchingAccount = user.accounts?.some(
      acc => acc.accountNumber === accountNumber && acc.ifsc === ifsc
    );

    if (!hasMatchingAccount) {
      return new Response(JSON.stringify({ msg: "Invalid account." }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ msg: "Account valid." }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error validating account:", err);
    return new Response(JSON.stringify({ msg: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
