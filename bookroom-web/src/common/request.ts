import type { AxiosResponse, RequestConfig } from '@umijs/max';
import { RequestOptions } from '@umijs/max';
import { message as messageCmp, notification } from 'antd';
import addAuthHeader from './addAuthHeader';
import { SERVER_BASE_URL } from '@/config/api';

// 错误处理方案： 错误类型
enum ErrorShowType {
  // 不提示
  SILENT = 0,
  // 警告提示
  WARN_MESSAGE = 1,
  // 错误提示
  ERROR_MESSAGE = 2,
  // 通知提示
  NOTIFICATION = 3,
  // 跳转
  REDIRECT = 9,
}
// 与后端约定的响应数据格式
interface ResponseStructure {
  data: any;
  code?: number;
  message?: string;
  showType?: ErrorShowType;
}
// 状态码
export enum STATUS_CODE_ENUM {
  // 服务器响应成功
  SUCCESS = 200,
  // 错误的请求
  BAD_REQUEST = 400,
  // 服务器鉴权未通过
  NOT_AUTH = 401,
  // 服务器拒绝请求
  UN_ACESSIBLE = 403,
  // 资源不存在
  NOT_FOUND = 404,
  // 服务器错误
  SERVER_ERROR = 500,
}
// 运行时配置
const requestConfig: RequestConfig = {
  // 统一的请求设定
  baseURL: SERVER_BASE_URL,
  timeout: 30000,
  headers: {
    'X-Requested-With': 'XMLHttpRequest',
  },
  // 错误处理
  errorConfig: {
    // 状态码200下，业务级别错误抛出
    errorThrower: (res: ResponseStructure) => {
      const { data, code, message } = res;
      if (code) {
        throw {
          name: 'BizError',
          info: {
            code,
            message,
            data,
          },
        };
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: RequestOptions) => {
      // 忽略错误，返回Axios的错误||自定义错误
      if (opts?.skipErrorHandler) throw error?.response || error;
      // 自定义 errorThrower 抛出错误
      if (error.name === 'BizError') {
        const errorInfo: ResponseStructure | undefined = error.info;
        if (errorInfo) {
          const { message, code } = errorInfo;
          switch (errorInfo.showType) {
            case ErrorShowType.SILENT:
              // do nothing
              break;
            case ErrorShowType.WARN_MESSAGE:
              messageCmp.warning(message);
              break;
            case ErrorShowType.ERROR_MESSAGE:
              messageCmp.error(message);
              break;
            case ErrorShowType.NOTIFICATION:
              notification.open({
                description: message,
                message: code,
              });
              break;
            case ErrorShowType.REDIRECT:
              // TODO: redirect
              break;
            default:
              messageCmp.error(message);
          }
        }
        throw errorInfo;
      }
      // Axios的错误
      // 请求成功发出且服务器也响应了状态码，但状态代码超出了 2xx 的范围
      if (error?.response) {
        // message.error(`服务器状态码:${error.response?.status}`);
        const { data, status } = error?.response || {};
        let message;
        if (status === STATUS_CODE_ENUM.NOT_AUTH) {
          message = data?.message || '服务器鉴权未通过';
        }
        if (status === STATUS_CODE_ENUM.BAD_REQUEST) {
          message = data?.message || '接口请求错误';
        }
        if (status === STATUS_CODE_ENUM.NOT_FOUND) {
          message = data?.message || '接口不存在';
        }
        if (!message) {
          message = data?.message || '服务器请求错误';
        }
        messageCmp.error(message);
        throw error?.response;
      }
      // 请求已经成功发起，但没有收到响应
      if (error.request) {
        // \`error.request\` 在浏览器中是 XMLHttpRequest 的实例，
        // 而在node.js中是 http.ClientRequest 的实例
        messageCmp.error('服务器无响应，请重试');
        return;
      }
      // 发送请求时出了点问题
      messageCmp.error('请求出错，请重试');
    },
  },
  // 请求拦截器
  requestInterceptors: [
    async (url: string, options: any) => {
      const { noAuth } = options;
      let newConfig: any = {
        url: url,
        options: options,
      };
      // 如果不存在noAuth标识，则向后端传递token
      if (!noAuth) {
        newConfig = await new Promise((resolve, reject) => {
          addAuthHeader({
            ...newConfig,
            resolve,
          }).catch((error) => {
            reject(error);
          });
        });
      }
      if (!newConfig) {
        throw new Error('请求配置错误');
      }
      // 拦截请求配置，进行个性化处理。
      return { url: newConfig.url, options: newConfig.options };
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    [
      (response: AxiosResponse) => {
        return response;
      },
    ],
  ],
};

export default requestConfig;
