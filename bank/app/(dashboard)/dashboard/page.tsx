import { prisma } from "@/db";
import type { Metadata } from "next";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { NEXT_AUTH } from "@/lib/auth";
import { redirect } from "next/navigation";
import { FaLock, FaRegCreditCard } from "react-icons/fa";

export const metadata: Metadata = {
  title: "ZenBank Dashboard - Your Accounts & Transactions",
  description: "Securely manage your ZenBank accounts, view balances, recent transactions and perform quick transfers.",
  openGraph: {
    title: "ZenBank Dashboard",
    description: "Manage your accounts, balances and transactions securely.",
    url: "https://zenbank.com/dashboard",
    siteName: "ZenBank",
    images: [
      {
        url: "https://zenbank.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "ZenBank Dashboard",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ZenBank Dashboard",
    description: "Your all-in-one banking dashboard.",
    images: ["https://zenbank.com/og-image.png"],
  },
};

export default async function Dashboard() {
  const session = await getServerSession(NEXT_AUTH);
  if (!session?.user?.email) {
    redirect("/auth/signin");
  }

  const userDetails = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  const accounts = await prisma.account.findMany({
    where: { userId: userDetails?.id },
    select: {
      id: true,
      amount: true,
      accountNumber: true,
      ifsc: true,
      withdrawals: {
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          amount: true,
          provider: true,
          status: true,
          createdAt: true,
        },
      },
      deposits: {
         orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          amount: true,
          provider: true,
          status: true,
          createdAt: true,
        },
      }
    },
  });
const transactions = accounts
  .flatMap((acc) => [
    ...acc.withdrawals.map((tx) => ({
      ...tx,
      type: "Withdraw",
      accountNumber: acc.accountNumber,
    })),
    ...acc.deposits.map((tx) => ({
      ...tx,
      type: "Deposit",
      accountNumber: acc.accountNumber,
    })),
  ])
  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen rounded-lg">
      <h1 className="mt-14 text-3xl font-bold mb-8 text-blue-800">
        Welcome to your ZenBank Dashboard
      </h1>

      <div className="flex flex-wrap justify-center gap-6 w-full">
        {accounts.map((acc, index) => (
          <div
            key={acc.id}
            className={`w-full sm:w-80 rounded-2xl bg-gradient-to-br ${
              index % 3 === 0
                ? "from-[#5e60ce] to-[#4361ee]"
                : index % 3 === 1
                ? "from-[#9d4edd] to-[#7b2cbf]"
                : "from-[#4895ef] to-[#4361ee]"
            } text-white p-6 shadow-lg transition-transform hover:scale-105`}
          >
            <div className="flex justify-between items-center mb-8">
              <FaRegCreditCard className="text-2xl" />
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                IFSC: {acc.ifsc}
              </span>
            </div>
            <div className="text-xl font-mono tracking-widest mb-2">
              {acc.accountNumber}
            </div>
            <div className="text-md font-mono tracking-widest mb-2">
              Balance: ₹ {(acc.amount / 100).toFixed(2)}
            </div>
            <div className="flex justify-between text-sm">
              <div>
                <div className="uppercase text-xs text-gray-200">Expires</div>
                <div className="font-semibold">**/**</div>
              </div>
              <div className="flex flex-col items-end">
                <div className="uppercase text-xs text-gray-200">CVV</div>
                <div className="flex items-center gap-1 font-semibold">
                  ***<FaLock className="text-green-400 ml-1" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="my-10 flex gap-4 justify-center w-full">
        <Link href="/create-account">
          <span className="bg-green-500 hover:bg-green-600 text-black py-2 px-6 rounded-xl shadow transition">
            Open New Account
          </span>
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-4 text-blue-700">
        Recent Transactions
      </h1>

      <div className="bg-blue-50 rounded-2xl shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-blue-100">
            <tr>
              <th className="py-3 px-6 text-left">Date</th>
              <th className="py-3 px-6 text-left">Account Number</th>
              <th className="py-3 px-6 text-left">Description</th>
              <th className="py-3 px-6 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-t hover:bg-gray-50 transition">
                <td className="py-3 px-6">{new Date(tx.createdAt).toLocaleString()}</td>
                <td className="py-3 px-6 font-mono tracking-wide font-semibold">
                  {tx.accountNumber}
                </td>
                <td className="py-3 px-6 font-semibold">{tx.provider}</td>
                <td
                  className={`py-3 px-6 text-right ${
                    tx.status === "SUCCESS"
                      ? tx.type === "Withdraw"
                        ? "text-red-600"
                        : "text-green-600"
                      : "text-black"
                  }`}
                >
                  <span className="font-semibold">
                    {tx.type === "Withdraw" && tx.status === "SUCCESS" ? "-" : tx.type === "Deposit" ? "+" : ""} ₹ {(tx.amount / 100).toFixed(2)}
                  </span>

                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
