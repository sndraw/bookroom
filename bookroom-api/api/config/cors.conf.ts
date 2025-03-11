
// 跨域允许
export const allowOriginList = process.env.CORS_ALLOW_ORIGIN
  ? process.env.CORS_ALLOW_ORIGIN.split(",")
  : null;

export const corsOptions = {
  origin: (ctx:any) => {
    const origin = ctx.get("Origin");
    if (
      origin &&
      allowOriginList &&
      allowOriginList.length &&
      allowOriginList.includes(origin)
    ) {
      return origin;
    }
    return false;
  },
  maxAge: 1728000,
  credentials: true,
  allowMethods: ["GET", "POST", "DELETE", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["X-Requested-With", "Content-Type", "Authorization", "Accept"],
  exposeHeaders: ["WWW-Authenticate", "Server-Authorization"],
};