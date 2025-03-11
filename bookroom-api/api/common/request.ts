/**
 * http配置
 */
// 引入axios
import axios from "axios";
import qs from "qs";
import { logger } from "./logger"; //  日志
// 创建实例
const instance = axios.create();
// 超时时间
instance.defaults.timeout = 300000;
instance.defaults.withCredentials = true;
instance.defaults.responseType = "json";
// http请求拦截器
instance.interceptors.request.use(
  (config) => {
    const { serialize = false } = config.headers;
    config.headers = {
      ...config.headers,
      post: { "Content-Type": "application/json" },
    };
    config.params = Object.assign(
      {
        _t: new Date().getTime() + Math.random(),
      },
      config.params
    );
    // POST传参序列化
    if (config.method === "post" && serialize) {
      config.data = qs.stringify(config.data);
      delete config.headers.serialize;
    }
    return config;
  },
  (error) => {
    logger.error({
      url: error.request.config.url,
      error: error.request,
    });
    return Promise.reject(error);
  }
);

// http响应拦截器
instance.interceptors.response.use(
  async (response) => {
    const res = response?.data;
    if (!res) {
      const error = new Error( res?.message ||"请求失败");
      logger.error({
        url: response.config.url,
        error: error,
      });
      return Promise.reject(error);
    }
    return res;
  },
  (error) => {
    logger.error({
      url: error?.config?.url,
      error: error,
    });
    return Promise.reject(error);
  }
);

export default instance;
