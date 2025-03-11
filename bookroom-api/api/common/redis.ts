import Redis from "ioredis";
import redisConf from "../config/redis.conf";
// 创建redis连接
export const redisClient = new Redis({
  ...redisConf,
  retryStrategy: (times: number) => {
    const delay = Math.min(times * 1000, 5000); // 最大重试间隔为 5 秒
    console.log(`Redis 重连尝试次数: ${times}, 重试间隔: ${delay}ms`);
    return delay;
  }
});

// redis连接
redisClient.on("connect", () => {
  console.log("redis连接成功:", redisConf.host, redisConf.port);
});
// redis错误
redisClient.on("error", (err: any) => {
  console.log("redis连接错误:", err);
});
// redis重连
redisClient.on("reconnecting", () => {
  console.log("redis正在重连...");
});

// 设置redis数据-指定散列键值对
const setItem = (hashKey: any, field: any, value: any, exprires: string | number) => {
  let redisKey = hashKey;
  if (redisConf.name) {
    redisKey = `${redisConf.name}:${hashKey}`;
  }
  return new Promise((resolve, reject) => {
    redisClient.hset(redisKey, field, value, (err: any, reply: any) => {
      if (err) {
        console.log(err);
        reject(err);
      }
      // 设置过期
      if (exprires) {
        redisClient.expire(redisKey, exprires);
      }
      resolve(reply);
    });
  });
};
// 设置redis数据-为散列里面的一个或多个键设置值
const setMulItems = (hashKey: any, data = {}, exprires: string | number) => {
  let redisKey = hashKey;
  if (redisConf.name) {
    redisKey = `${redisConf.name}:${hashKey}`;
  }
  return new Promise((resolve, reject) => {
    redisClient.hset(redisKey, data, (err: any, reply: any) => {
      if (err) {
        console.log(err);
        reject(err);
      }
      // 设置过期
      if (exprires) {
        redisClient.expire(redisKey, exprires);
      }
      resolve(reply);
    });
  });
};
// 获取redis数据-指定散列键
const getItem = (hashKey: any, field:any = null) => {
  let redisKey = hashKey;
  if (redisConf.name) {
    redisKey = `${redisConf.name}:${hashKey}`;
  }
  return new Promise((resolve, reject) => {
    redisClient.hget(redisKey, field, (err: any, val: any) => {
      if (err) {
        reject(err);
      }
      resolve(val);
    });
  });
};
// 获取redis数据-散列包含的全部键值对
const getAllItems = (hashKey: any) => {
  let redisKey = hashKey;
  if (redisConf.name) {
    redisKey = `${redisConf.name}:${hashKey}`;
  }
  return new Promise((resolve, reject) => {
    redisClient.hgetall(redisKey, (err: any, val: any) => {
      if (err) {
        reject(err);
      }
      resolve(val);
    });
  });
};
// 获取redis数据-多个散列值
const getMulItems = (hashKey: any, fields:any = []) => {
  let redisKey = hashKey;
  if (redisConf.name) {
    redisKey = `${redisConf.name}:${hashKey}`;
  }
  return new Promise((resolve, reject) => {
    redisClient.hmget(redisKey, fields, (err: any, val: any) => {
      if (err) {
        reject(err);
      }
      resolve(val);
    });
  });
};
// 删除redis数据-指定散列键
const delItem = (hashKey: any, field: any) => {
  let redisKey = hashKey;
  if (redisConf.name) {
    redisKey = `${redisConf.name}:${hashKey}`;
  }
  return new Promise((resolve, reject) => {
    redisClient.hdel(redisKey, field, (err: any, val: any) => {
      if (err) {
        reject(err);
      }
      resolve(val);
    });
  });
};
// 删除redis数据-指定散列全部键值对
const delAllItems = (hashKey: any) => {
  let redisKey = hashKey;
  if (redisConf.name) {
    redisKey = `${redisConf.name}:${hashKey}`;
  }
  return new Promise((resolve, reject) => {
    redisClient.del(redisKey, (err: any, val: any) => {
      if (err) {
        reject(err);
      }
      resolve(val);
    });
  });
};

export default {
  client: redisClient,
  setItem,
  setMulItems,
  getItem,
  getAllItems,
  getMulItems,
  delItem,
  delAllItems,
};