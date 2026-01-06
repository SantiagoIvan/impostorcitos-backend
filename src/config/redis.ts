import Redis from "ioredis";

if (!process.env.REDIS_URL) {
  throw new Error("REDIS_URL no está definida");
}

const environment = process.env.ENV
const redisUrl = environment === "DEV"? process.env.REDIS_URL_LOCAL : process.env.REDIS_URL 

const redis = new Redis(redisUrl || "redis://localhost:6379", {
  maxRetriesPerRequest: 2,
  enableReadyCheck: true,
});

redis.on("connect", () => {
  console.log("Redis (Render) conectado");
});

redis.on("error", (err) => {
  console.error("Redis error:", err.message);
});

export default redis;
