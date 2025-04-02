
import { Sequelize } from "sequelize";

import databaseConf from "../config/database.conf";

const dialect: any = databaseConf?.dialect;

const sequelize = new Sequelize(
  String(databaseConf.database),
  String(databaseConf.user),
  databaseConf.password,
  {
    host: databaseConf.host,
    port: Number(databaseConf.port),
    dialect: dialect || "mysql",
    logging: false,
    pool: {
      max: 5,
      min: 0,
      idle: 10000,
      acquire: 30000,
      evict: 10000,
    },
    timezone: databaseConf.timezone,
    query: { raw: false },
    retry: {
      name: "mysql sequelize",
      match: [
        /ETIMEDOUT/,
        /EHOSTUNREACH/,
        /ECONNRESET/,
        /ECONNREFUSED/,
        /ENOTFOUND/,
        /EAI_AGAIN/,
        /SequelizeConnectionError/,
        /SequelizeConnectionRefusedError/,
        /SequelizeHostNotFoundError/,
        /SequelizeHostNotReachableError/,
        /SequelizeAccessDeniedError/,
        /SequelizeAuthenticationError/,
        /SequelizeInvalidConnectionError/,
        /SequelizeConnectionTimedOutError/
      ],
      max: 5, // 最大重试次数
      timeout: 10000, // 超时时间
      backoffBase: 1000, // 重试间隔基数
      backoffExponent: 1.5, // 重试间隔指数
      // report: (message: string) => {
      //   console.log("数据库日志：", message);
      // }
    }
  }
);

// 测试数据库链接
const connectAuth = () => {
  sequelize
    .authenticate()
    .then(async function () {

      if (Number(process.env.NODE_APP_INSTANCE) > 0) {
        console.log('This is a worker process with instance ID:', process.env.NODE_APP_INSTANCE);
      } else {
        console.log('This is the master process.');
        try {
          const DB_SYNC_ALTER = process.env.DB_SYNC_ALTER === 'true';
          const DB_SYNC_FORCE = process.env.DB_SYNC_FORCE === 'true';
          if (DB_SYNC_ALTER || DB_SYNC_FORCE) {
            console.log("数据库结构同步：", DB_SYNC_ALTER);
            console.log("数据库强制同步：", DB_SYNC_FORCE);
            await sequelize.sync({ alter: DB_SYNC_ALTER, force: DB_SYNC_FORCE });
          } else {
            await sequelize.sync();
          }
          console.log("数据库同步成功！");
        } catch (error) {
          console.log(`数据库同步失败：${error}`);
          throw error;
        }
      }

      console.log("数据库连接成功:", databaseConf.host, databaseConf.port);
    })
    .catch(function (error) {
      console.log(`数据库连接失败：'${error}`);
      // 数据库连接失败时打印输出
      // throw error;
    });
}
connectAuth();
export default sequelize;