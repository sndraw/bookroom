/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！

declare namespace API {
  interface AgentInfo {
    id: string;
    name: string;
    platformId?: string;
    platformCode?:string;
    description?: string;
    type?: string;
    parameters?: any;
    messages?:any;
    status?: number;
    createdAt?: number;
    updatedAt?: number;
  }

  interface AgentInfoVO {
    name?: string;
    platformId?: string;
    platformCode?:string;
    description?: string;
    type?: string;
    code?:string;
    parameters?: any;
    messages?: any;
    status?: number;
  }
  interface Result_AgentInfo_ {
    code?: number;
    message?: string;
    data?: AgentInfo;
  }
  interface Result_AgentInfoList_ {
    code?: number;
    message?: string;
    data?: AgentInfo[];
  }

  interface PageInfo_AgentInfo_ {
    current?: number;
    pageSize?: number;
    total?: number;
    list?: AgentInfo[];
  }

  interface Result_PageInfo_AgentInfo__ {
    code?: number;
    message?: string;
    data?: PageInfo_AgentInfo_;
  }
}
