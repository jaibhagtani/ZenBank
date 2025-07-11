"use server";
import { prisma } from "@/db";
import { redisclient } from "@/redis/redisclient";

export async function getDetailsAccordingToBankToken(bankToken: string) {
  if (!bankToken) return null;

  if (!redisclient.isOpen) {
    await redisclient.connect();
  }
    
  const redisKey = `bankToken:${bankToken}`;
  const data = await redisclient.get(redisKey);
  if (!data) return null;
  const dataJson = await JSON.parse(data);
  return dataJson;
}


export async function getAccountDetails(accountNumber: string, ifsc: string, access_token: string)
{
    const accountDetails = await prisma.account.findFirst({
        where: {
            accountNumber: accountNumber,
            ifsc: ifsc
        },
        select: {
            userId: true,
            linkedWallets: {
                where: {
                    accessToken: access_token
                },
                select: {
                    walletUserId: true
                }
            }
        }
    })

    // console.log(accountDetails)

    return accountDetails;
}
