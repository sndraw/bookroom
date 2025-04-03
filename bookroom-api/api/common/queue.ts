import bull from 'bull';
import redisConf from "../config/redis.conf";
import { logger } from './logger';


export const createQqueue = (ops: { name: string, db?: number }) => {
    const { name, db = 0 } = ops;
    logger.info(`创建队列: ${name} | Redis: ${db}`);
    return new bull(name, {
        redis: {
            ...redisConf,
            db: db,
            retryStrategy: (times: number) => {
                const delay = Math.min(times * 1000, 5000); // 最大重试间隔为 5 秒
                console.log(`Redis 数据库${db} 重连尝试次数: ${times}, 重试间隔: ${delay}ms`);
                return delay;
            }
        }
    });
};
