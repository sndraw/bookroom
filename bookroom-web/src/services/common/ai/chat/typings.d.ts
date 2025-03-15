/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！

declare namespace API {
  interface AIChatInfo {
    id: string;
    platformId?: string;
    platform?: string;
    model: string;
    type: number;
    parameters: object;
    prompt?: string;
    messages: any[];
    userId: number;
    status: number;
    createdAt: number;
    updatedAt: number;
  }

  interface AIChatInfoVO {
    platformId?: string;
    platform?: string;
    model: string;
    type?: number;
    prompt?: string;
    parameters?: object;
    messages?: any[];
    userId?: number;
    status?: number;
  }
  interface Result_AIChatInfo_ {
    code?: number;
    message?: string;
    data?: AIChatInfo;
  }

  interface PageInfo_AIChatInfo_ {
    current?: number;
    pageSize?: number;
    total?: number;
    record?: AIChatInfo,
    list?: AIChatInfo[];
  }

  interface Result_PageInfo_AIChatInfo__ {
    code?: number;
    message?: string;
    data?: PageInfo_AIChatInfo_;
  }
}
