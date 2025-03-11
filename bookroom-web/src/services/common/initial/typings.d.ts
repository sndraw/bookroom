declare namespace API {
  interface InitialData {
    id?: string;
    username?: string;
    email: string;
    role: string;
    status: number;
    notSetup?: boolean;
    notInited?: boolean;
  }

  interface InitialDataVO {
    username?: string;
    email?: string;
    role?: string;
    status?: number | string;
    // 未安装/未初始化
    notSetup?: boolean;
    // 未加载数据
    notInited?: boolean;
    siteInfo?: SiteInfo;
    errorMessage?: string;
  }

  interface Result_InitialData_ {
    code?: number;
    message?: string;
    data?: InitialDataVO;
  }
}
