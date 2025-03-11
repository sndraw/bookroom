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
    uid: string;
    // 文件名称
    name: string;
    // 上传状态
    status: string;
    // 存储地址
    url: string;
    // 缩略图地址
    thumbUrl?: string;
    // 上传人员
    userId?: string;
  }
  // 文件信息-VO
  interface FileInfoVO {
    // 名称
    name: string;
    // 上传状态
    status: string;
    // 存储地址
    url: string;
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

  interface Result_List_UploadedFileInfo_ {
    code?: number;
    message?: string;
    data?: UploadedFileInfo[];
  }
}
