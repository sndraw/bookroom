// 导入自定义环境变量
import path from "path";
import Koa, { Context } from "koa";
import cors from "koa2-cors";
import session from "koa-session";
import bodyParser from "koa-bodyparser";
import koaBody from "koa-body";
import favicon from "koa-favicon";
import jwt from "./middlewares/jwt.middleware";

import routers from "./routers/index";
import { logger, accessLogger } from "./common/logger";
import sessionConf from "./config/session.conf";
import { allowOriginList, corsOptions } from "./config/cors.conf";
import cookieConf from "./config/cookie.conf";
import redis from "./common/redis";
import parameter from "./middlewares/parameter.middleware";
import setup from "./middlewares/setup.middleware";

import fs from "fs";
import { escape } from "querystring";

const app = new Koa();

// 注册redis client到全局状态
app.context.redis = redis;
// 注册日志到全局状态
app.context.logger = logger;
// 错误
app.on("error", (err: any, ctx: { url: any; }) => {
  logger.error({
    error: err,
    url: ctx.url,
  });
});
// 跨域请求
if (allowOriginList && allowOriginList.length) {
  app.use(cors(corsOptions));
}
app.use(koaBody({
  multipart: true,
  formLimit: "20mb",
  jsonLimit: "20mb",
  textLimit: "20mb",
  formidable: {
    uploadDir: path.join(__dirname, "/uploads"), // 设置文件上传目录
    keepExtensions: true, // 保持文件的后缀
    maxFieldsSize: 20 * 1024 * 1024, // 文件上传大小限制
    onFileBegin: (name, file) => {
      const dir = path.join(__dirname, `/uploads`);
      // 检查文件夹是否存在如果不存在则新建文件夹
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
      }
    }
  },
}));
// 将post请求参数封装到ctx.request.body中
app.use(
  bodyParser({
    // 允许上传文件大小
    formLimit: "20mb",
    jsonLimit: "20mb",
    textLimit: "20mb",
    xmlLimit:"20mb",
    enableTypes: ["json", "form", "text", "xml"],
  })
);
// 参数校验
app.use(parameter(app));

// 解决ico加载问题
app.use(favicon(path.join(__dirname, "/public/favicon.ico")));
// cookie加密
app.keys = cookieConf.keys;
// app.keys = new KeyGrip(['im a newer secret', 'i like turtle'], 'sha256')
app.use(accessLogger());
// session
app.use(session(sessionConf, app));
// 处理请求时间计算
app.use(async (ctx: Context, next: () => any) => {
  console.log("request:", ctx.request.method, ctx.url);
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.set("X-Response-Time", `${ms}ms`);
});
app.use(setup());
app.use(jwt());
app.use(routers.routes());

export default app;
