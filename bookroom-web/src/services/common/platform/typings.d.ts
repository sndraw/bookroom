/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！

declare namespace API {
  interface PlatformInfo {
    id: string;
    name: string;
    code: string;
    type: string;
    host: string;
    apiKey?: string;
    parameters?: string | object;
    // 状态：0停止，1运行
    status?: number | string;
  }

  interface PlatformInfoVO {
    name: string;
    host: string;
    code: string;
    type:string;
    parameters?: string | object;
    // 状态：0停止，1运行
    status?: number | string;
  }

  interface Result_PlatformInfo_ {
    code?: number;
    message?: string;
    data?: PlatformInfo;
  }

  interface Result_PlatformInfoList_ {
    code?: number;
    message?: string;
    data?: PlatformInfo[];
  }

  interface PageInfo_PlatformInfo_ {
    current?: number;
    pageSize?: number;
    total?: number;
    list?: PlatformInfo[];
  }

  interface Result_PageInfo_PlatformInfo__ {
    code?: number;
    message?: string;
    data?: PageInfo_PlatformInfo_;
  }
}
