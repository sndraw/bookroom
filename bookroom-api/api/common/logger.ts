
import log4js from "koa-log4";
import logsConf from "../config/logs.conf"; // 日志配置
// 日志配置
log4js.configure({
  appenders: {
    access: {
      type: "dateFile",
      pattern: "-yyyy-MM-dd.log", // 生成文件的规则
      alwaysIncludePattern: true,
      filename: logsConf.access.filename, // 生成文件名
    },
    application: {
      type: "dateFile",
      pattern: "-yyyy-MM-dd.log",
      alwaysIncludePattern: true,
      filename: logsConf.application.filename,
    },
    out: {
      type: "console",
    },
  },
  categories: {
    default: { appenders: ["out"], level: "info" },
    access: { appenders: ["access"], level: "info" },
    application: { appenders: ["application"], level: "WARN" },
  },
  // 关于pm2的设置
  pm2: true,
  disableClustering: true,
});

// 记录所有应用级别的日志
export const logger = log4js.getLogger("application");
// 记录所有访问级别的日志
export const accessLogger = () => log4js.koaLogger(log4js.getLogger("access"));
