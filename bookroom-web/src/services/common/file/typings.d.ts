declare namespace API {
  // 上传文件信息
  interface UploadFileInfo {
    // 文件
    file?: any;
    files?: any;
  }
  interface UploadedFileInfo {
    filename: string;
    objectId: string;
    previewUrl: string;
    downloadUrl: string;
  }
  // 文件信息
  interface FileInfo {
    id: string;
    // 文件名称
    name: string;
    // 对象ID
    objectId: string;
    // 存储路径
    path?: string;
    // 父路径
    parentPath?: string;
    // 存储地址
    url?: string;
    // 是否文件夹
    isDir?: boolean;
    // 文件大小
    size?: number;
    // 文件类型
    mimeType?: string;
    // 上传状态
    status: string;
    // 缩略图地址
    thumbUrl?: string;
    // 创建时间
    createdTime?: string;
    // 更新时间
    updatedTime?: string;
    // 最后修改时间
    lastModified?:string;
    // 上传人员
    userId?: string;
  }
  // 文件信息-VO
  interface FileInfoVO {
    // 文件名称
    name: string;
    // 对象ID
    objectId: string;
    // 存储路径
    path?: string;
    // 父路径
    parentPath?: string;
    // 存储地址
    url?: string;
    // 是否文件夹
    isDir?: boolean;
    // 文件大小
    size?: number;
    // 文件类型
    mimeType?: string;
    // 上传状态
    status: string;
    // 缩略图地址
    thumbUrl?: string;
    // 上传人员
    userId?: string;
  }

  interface Result_FileInfo_ {
    code?: number;
    message?: string;
    data?: FileInfo;
  }

  interface Result_UploadedFileInfo_ {
    code?: number;
    message?: string;
    data?: UploadedFileInfo;
  }

  interface Result_UploadedFileInfoList_ {
    code?: number;
    message?: string;
    data?: {
      list: UploadedFileInfo[];
    }
  }
}
