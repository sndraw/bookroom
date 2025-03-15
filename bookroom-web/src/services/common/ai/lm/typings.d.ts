/* eslint-disable */
// 该文件由 OneAPI 自动生成，请勿手动修改！

declare namespace API {
  interface AILmInfo {
    id?: string;
    name: string;
    platform: string;
    platformId: string;
    platformCode: string;
    platformHost: string;
    model: string;
    modified_at: Date;
    size: number;
    digest?: string;
    details?: {
      parent_model?: string;
      format?: string;
      family?: string;
      families?: string[];
      parameter_size?: string;
      quantization_level?: string;
    };
    type?: string;
    typeName?: string;
    // 状态：0停止，1运行
    status?: number | string;
    updatedAt?: Date;
    createdAt?: Date;
  }

  interface AILmInfoVO {
    name: string;
    platform: string;
    platformId: string;
    platformCode: string;
    platformHost: string;
    model: string;
    modified_at: Date;
    size: number;
    digest?: string;
    details?: {
      parent_model?: string;
      format?: string;
      family?: string;
      families?: string[];
      parameter_size?: string;
      quantization_level?: string;
    };
    type?: string;
    typeName?: string;
    // 状态：0停止，1运行
    status?: number | string;
    updatedAt?: Date;
    createdAt?: Date;
  }

  interface Result_AILmInfo_ {
    code?: number;
    message?: string;
    data?: AILmInfo;
  }

  interface PageInfo_AILmInfo_ {
    current?: number;
    pageSize?: number;
    total?: number;
    list?: AILmInfo[];
  }

  interface Result_PageInfo_AILmInfo__ {
    code?: number;
    message?: string;
    data?: PageInfo_AILmInfo_;
  }
}