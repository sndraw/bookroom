/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！

declare namespace API {
  interface AIPlatformInfo {
    id: string;
    name: string;
    code: string;
    host: string;
    apiKey?: string;
    paramsConfig?: object;
    // 状态：0停止，1运行
    status?: number | string;
  }

  interface AIPlatformInfoVO {
    name: string;
    host: string;
    code: string;
    paramsConfig?: object;
    // 状态：0停止，1运行
    status?: number | string;
  }

  interface Result_AIPlatformInfo_ {
    code?: number;
    message?: string;
    data?: AIPlatformInfo;
  }

  interface Result_AIPlatformInfoList_ {
    code?: number;
    message?: string;
    data?: AIPlatformInfo[];
  }

  interface PageInfo_AIPlatformInfo_ {
    current?: number;
    pageSize?: number;
    total?: number;
    list?: AIPlatformInfo[];
  }

  interface Result_PageInfo_AIPlatformInfo__ {
    code?: number;
    message?: string;
    data?: PageInfo_AIPlatformInfo_;
  }
}
