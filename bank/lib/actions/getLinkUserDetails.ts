"use server";
import { redisclient } from "@/redis/redisclient";

export async function getLinkAccountDetails(token: string) {
  if (!token) return null;

  if (!redisclient.isOpen) {
    await redisclient.connect();
  }

  const data = await redisclient.get(`Link_auth_token:${token}`);
  if (!data) return null;

  return JSON.parse(data);
}
