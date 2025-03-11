
export default {
  key: "bookroom-api:session",
  maxAge: 86400000 /*  cookie的过期时间 */,
  overwrite: true /** (boolean) can overwrite or not (default true) */,
  httpOnly: true /**  true表示只有服务器端可以获取cookie */,
  signed: true /** 默认 签名 */,
  rolling: true /** 在每次请求时强行设置 cookie，这将重置 cookie 过期时间（默认：false) */,
  renew: false /** (boolean) renew session when session is nearly expired session接近过期时重新生成新的session */,
};
