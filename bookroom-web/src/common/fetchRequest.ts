import { message as messageCmp } from 'antd';
import queryString from 'query-string';
import addAuthHeader from './addAuthHeader';
import { SERVER_BASE_URL } from '@/config/api';

export const postFetch = async (opts: {
  url: string;
  body: any;
  options?: { [key: string]: any };
  stringify?: boolean; // 是否需要将body转换为字符串
  skipErrorHandler?: boolean;
  is_stream?: boolean;
}) => {
  const {
    url,
    body,
    options: originOptions,
    stringify = true,
    is_stream,
  } = opts;

  try {
    const options = {
      ...(originOptions || {}),
    };
    if (!options?.headers) {
      options.headers = {};
    }

    if (!body?.stream && !body?.is_stream && is_stream) {
      body.is_stream = true;
    } else {
      body.is_stream = false;
    }
    // 将 params 附加到 URL 上
    const paramStr = queryString.stringify({
      _t: Math.random(),
    });
    // 拼接完整路由
    const fullUrl = `${options?.baseURL || SERVER_BASE_URL}${url}?${paramStr}`;
    // 请求参数处理
    const reqOptions = {
      method: 'POST',
      body: stringify
        ? JSON.stringify({
          ...(body || {}),
        })
        : body,
      headers: {
        'Content-Type': 'application/json',
      },
      ...(options || {}),
    };
    const { noAuth } = options;

    // 构建新的请求配置
    let newConfig: any = {
      url: fullUrl,
      options: reqOptions,
    };

    // 如果不存在noAuth标识，则向后端传递token
    if (!noAuth) {
      // 重新构建新的请求配置
      newConfig = await new Promise((resolve, reject) => {
        addAuthHeader({
          ...newConfig,
          resolve,
        }).catch((err) => {
          reject(err);
        });
      });
    }
    if (!newConfig) {
      throw new Error('请求配置错误');
    }
    // 发送请求
    return fetch(newConfig.url, newConfig.options).then(async (response) => {
      if (!is_stream) {
        return response;
      }
      if (!response?.ok) {
        throw response;
      }
      // 获取响应体的流
      const reader = response?.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      return {
        response,
        reader,
        decoder,
      };
    });
  } catch (error) {
    // 忽略错误，返回Axios的错误||自定义错误
    if (opts?.skipErrorHandler) throw error;
    console.error(error);
    messageCmp.error('请求错误，请稍后再试。');
  }
};
