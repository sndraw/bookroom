declare namespace API {
  interface LoginInfo {
    username: string;
    password: string;
    remember?: boolean;
    agreement?: boolean;
    // 操作来源
    originId?: string;
  }

  interface TokenInfo {
    access_token: string;
    refresh_token: string;
    expire_in: number | string;
  }

  interface Result_LoginInfo_ {
    code?: number;
    message?: string;
    data?: TokenInfo;
  }

  interface RegisterInfo {
    username: string;
    email: string;
    password: string;
    agreement?: boolean;
    // 操作来源
    originId?: string;
  }

  interface Result_RegisterInfo_ {
    code?: number;
    message?: string;
    data?: string;
  }

  interface RefreshTokenInfo {
    grant_type: string;
    refresh_token: string;
  }

  interface Result_RefreshTokenInfo_ {
    code?: number;
    message?: string;
    data?: TokenInfo;
  }
}
