/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！

declare namespace API {
  interface AgentInfo {
    id: string;
    name: string;
    code: string;
    host?:string;
    type: string;
    paramsConfig?: any;
    status: number;
    createdAt: number;
    updatedAt: number;
  }

  interface AgentInfoVO {
    name: string;
    code: string;
    host?:string;
    type: string;
    paramsConfig?: any;
    status: number;
    status: number;
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
