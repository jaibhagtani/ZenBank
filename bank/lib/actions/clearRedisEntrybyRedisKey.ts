"use server";

import { redisclient } from "@/redis/redisclient";

export async function clearRedisEntrybyRedisKey(redisKey: string) {
  if (!redisKey) return { message: "Missing fields" };
    try {
        await redisclient.del(redisKey)
    return { message: "redisEntry deleted successfully!" };
  } 
  catch (err) {
    console.error(err);
    return { message: "Failed to delete redisEntry" };
  }
}
