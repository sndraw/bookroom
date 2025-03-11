
const keys = process.env.COOKIE_KEYS || "bookroom-api-secret";
const maxAge = process.env.COOKIE_MAXAGE || 3 * 24 * 60 * 60;
export default {
  keys: keys.split(","), // 签名的 cookie 密钥数组
  namespace: process.env.COOKIE_NAMESPACE || "bookroom-api", // 命名空间
  maxAge: parseInt(String(maxAge)), // cookie有效时长，单位：秒
  domain: process.env.COOKIE_DOMAIN || "", // cookie可用域名，“.”开头支持顶级域名下的所有子域名
  secure: Boolean(process.env.COOKIE_SECURE), // 默认false，设置成true表示只有https可以访问
  httpOnly: Boolean(process.env.COOKIE_HTTPONLY), // 默认true，客户端不可读取
  overwrite: Boolean(process.env.COOKIE_OVERWRITE), // 一个布尔值，表示是否覆盖以前设置的同名的 cookie (默认是 false). 如果是 true, 在同一个请求中设置相同名称的所有 Cookie（不管路径或域）是否在设置此Cookie 时从 Set-Cookie 标头中过滤掉。
};