import { createClient } from "redis"

const redisUrl = process.env.REDIS_URL
// console.log(redisUrl);
export const redisclient = createClient ({
    url : process.env.REDIS_URL
});
redisclient.on("error", function(err) {
  throw err;
});

await redisclient.connect()