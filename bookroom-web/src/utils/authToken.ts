// http请求-鉴权标识
export const HTTP_AUTH_KEY =
  process.env?.UMI_APP_HTTP_AUTH_KEY || 'Authorization';
// http请求-鉴权值-前缀
export const HTTP_AUTH_VALUE_PREFIX =
  process.env?.UMI_APP_HTTP_AUTH_VALUE_PREFIX || 'Basic';
// token-存储标识
export const TOKEN_KEY = process.env?.UMI_APP_TOKEN_KEY || 'work_token';

// 保存token
export const setToken = (token: object | string) => {
  let tokenStr: string = '';
  if (typeof token === 'object') {
    tokenStr = JSON.stringify(token);
  }
  if (typeof token === 'string') {
    tokenStr = token;
  }
  localStorage.setItem(TOKEN_KEY, tokenStr);
};

// 获取token
export const getToken = () => {
  const tokenStr = localStorage.getItem(TOKEN_KEY);
  try {
    return tokenStr ? JSON.parse(tokenStr) : null;
  } catch (error) {
    return tokenStr;
  }
};

// 移除token
export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};


// 清理缓存
export const clearCache = () => {
  localStorage.clear();
};