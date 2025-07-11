import { ConfirmDeposit } from "@/components/comfirmDeposit";
import { prisma } from "@/db";
import { redisclient } from "@/redis/redisclient";
import { notFound } from "next/navigation";

// interface PageProps {
//   params: {
//     bankToken: string;
//   };
// }

async function getAccountDetails(accessToken: string) {
  const walletAccount = await prisma.wallet.findUnique({
    where: { 
      accessToken: accessToken
    },
    include: { 
      account: {
        select: {
          accountNumber: true,
          ifsc: true
        }
      }
    },
  });

  return walletAccount;
}

export default async function BankDepositPage({
  params,
}: {
  params: { bankToken: string };
}) {
  const bankToken = params.bankToken;

  const depositString = await redisclient.get(`bankToken:${bankToken}`);
  if (!depositString) return notFound();

  let depositData: {
    walletToken: string;
    accessToken: string;
    amount: number;
    bankToken: string;
    status: string;
  };

  try {
    depositData = JSON.parse(depositString);
  } catch (err) {
    console.error("Invalid Redis data for bankToken", err);
    return notFound();
  }

  if (!depositData?.accessToken || !depositData?.bankToken || !depositData?.walletToken || !depositData.amount) 
  {
    return notFound();
  }

  const walletAccountDetails = await getAccountDetails(depositData.accessToken);
  const accountNumber = walletAccountDetails?.account.accountNumber;
  const ifsc = walletAccountDetails?.account.ifsc
  if (!accountNumber) return notFound();

  return (
    <ConfirmDeposit
      accountNumber={accountNumber}
      ifsc={ifsc || ""}
      bankToken = {bankToken}
      amount={depositData.amount}
      redisKey = {`bankToken:${bankToken}`}
      toWallet = {walletAccountDetails.name}
      access_token={walletAccountDetails.accessToken || ""}
    />
  );
}
