declare namespace API {
  interface PageInfo {
    current?: number;
    pageSize?: number;
    total?: number;
    list?: Array<Record<string, any>>;
  }

  interface Result {
    message?: string;
    data?: Record<string, any>;
  }

  interface Result_string_ {
    code?: number;
    message?: string;
    data?: string;
  }

  interface SiteInfo {
    // 是否初始化
    setup?: boolean;
    // 平台标题/名称
    title: string;
    // 平台副标题
    subTitle: string;
    // 版权声明
    copyright: string;
    // 平台LOGO
    logo: string;
    // 平台ICON
    favicon: string;
  }
}
