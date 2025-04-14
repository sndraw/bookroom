/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！

declare namespace API {
  interface AIChatInfo {
    id: string;
    platformId?: string;
    platform?: string;
    name?: string;
    model: string;
    chat_type?: string;
    parameters?: string | object;
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
    name?: string;
    model: string;
    chat_type?: string;
    prompt?: string;
    parameters?: string | object;
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
