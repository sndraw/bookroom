/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！

declare namespace API {
  interface RoleInfo {
    id: string;
    // 角色名称
    name?: string;
    // 角色标识
    code?: string;
    // 状态：0禁用，1启用
    status?: number | string;
    // 操作来源
    originId?: string;
  }

  interface RoleInfoVO {
    // 角色名称
    name?: string;
    // 角色标识
    code?: string;
    // 状态：0禁用，1启用
    status?: number | string;
  }

  interface Result_RoleInfo_ {
    code?: number;
    message?: string;
    data?: RoleInfo;
  }
  interface Result_RoleInfoList_ {
    code?: number;
    message?: string;
    data?: RoleInfo[];
  }
  interface PageInfo_RoleInfo_ {
    current?: number;
    pageSize?: number;
    total?: number;
    list?: RoleInfo[];
  }

  interface Result_PageInfo_RoleInfo__ {
    code?: number;
    message?: string;
    data?: PageInfo_RoleInfo_;
  }
}
