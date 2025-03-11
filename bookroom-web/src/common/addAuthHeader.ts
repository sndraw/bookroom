import { reqRefreshToken } from '@/services/common/login';
import {
  getToken,
  HTTP_AUTH_KEY,
  HTTP_AUTH_VALUE_PREFIX,
  setToken,
} from '@/utils/authToken';
import { STATUS_CODE_ENUM } from './request';

interface ReqConfigType {
  url: string;
  options: any;
  resolve: any;
}

// 是否正在刷新token的标记
let isRefreshing = false;

// 存储需要重试的请求列表
let requests: ReqConfigType[] = [];

// 获取新的options
const getNewOptions = (options: any) => {
  const tokenObj = getToken();
  if (tokenObj?.access_token && options.headers) {
    options.headers[HTTP_AUTH_KEY] =
      `${HTTP_AUTH_VALUE_PREFIX} ${tokenObj?.access_token}`;
  }
  // 添加随机参数，规避缓存，
  const newOptions = {
    ...options,
    params: {
      ...(options?.params || {}),
      _t: Math.random(),
    },
  };
  return newOptions;
};

const addAuthHeader = async (reqConfig: ReqConfigType) => {
  try {
    // 获取当前的token对象，判断是否过期
    const tokenObj = getToken();
    // 如果过期时间小于当前时间，说明token已经过期，需要重新获取token
    if (tokenObj?.expires_in && tokenObj?.expires_in < Date.now()) {
      if (!isRefreshing) {
        isRefreshing = true;
        const refreshTokenObj = await reqRefreshToken({
          grant_type: 'refresh_token',
          refresh_token: tokenObj?.refresh_token,
        })
          .then((res) => {
            return res.data;
          })
          .catch((err) => {
            console.log(err);
          });
        if (!refreshTokenObj) {
          // 如果刷新失败，抛出错误
          throw {
            name: 'BizError',
            info: {
              code: STATUS_CODE_ENUM.NOT_AUTH,
              message: '登录过期，请重新登录',
            },
          };
        }
        // 重新设置token
        setToken(refreshTokenObj);
        // 重试所有缓存的请求
        for (const config of requests) {
          const { url, options, resolve } = config || ({} as ReqConfigType);
          const newOptions = getNewOptions(options);
          resolve({
            url,
            options: {
              ...newOptions,
            },
          });
        }
      } else {
        // 将请求缓存到requests数组中，等待刷新完成后重试
        requests.push(reqConfig);
        return;
      }
    }
    const { url, options, resolve } = reqConfig || {};
    const newOptions = getNewOptions(options);
    resolve({
      url,
      options: {
        ...newOptions,
      },
    });
  } catch (error) {
    console.error('验证请求失败:', error);
    throw error; // 重新抛出错误，以便调用者处理
  } finally {
    isRefreshing = false;
    requests = [];
  }
};
export default addAuthHeader;
