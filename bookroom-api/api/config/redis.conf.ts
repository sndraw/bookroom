import { RedisOptions } from "ioredis";
const redisConfig: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
  name: (process.env.REDIS_DATABASE || "koa2"),
  family: 4,
  db: 0,
};

export default redisConfig;