/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！

declare namespace API {
  interface UserInfo {
    id: string;
    // 用户名
    username: string;
    // 密码
    password?: string;
    // 邮箱
    email: string;
    // 角色
    role?: string;
    // 角色ID
    roleId?: string;
    // 角色名称
    roleName?: string;
    // 状态：0禁用，1启用
    status?: number | string;
    // 操作来源
    originId?: string;
  }

  interface UserInfoVO {
    // 用户名
    username?: string;
    // 密码
    password?: string;
    // 邮箱
    email?: string;
    // 角色
    role?: string;
    // 角色ID
    roleId?: string;
    // 角色名称
    roleName?: string;
    // 状态：0禁用，1启用
    status?: number | string;
    // 操作来源
    originId?: string;
  }

  interface Result_UserInfo_ {
    code?: number;
    message?: string;
    data?: UserInfo;
  }

  interface PageInfo_UserInfo_ {
    current?: number;
    pageSize?: number;
    total?: number;
    list?: UserInfo[];
  }

  interface Result_PageInfo_UserInfo__ {
    code?: number;
    message?: string;
    data?: PageInfo_UserInfo_;
  }
}
