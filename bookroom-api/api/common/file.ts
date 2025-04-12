import minioConfig from "@/config/minio.conf"
import MinioApi from "@/SDK/minio";
import CryptoJS from "crypto-js";
import path from "path";


export const getObjectPath = (req_path?: string, salt?: string): string => {
  const salted = CryptoJS.SHA1(salt || "default").toString();
  // 如果req_path没有以斜杠结尾，则添加斜杠
  if (!req_path || !req_path.endsWith("/")) {
    req_path = `${req_path}/`;
  }
  return path.join(salted, req_path).replaceAll(/\\/g, "/");
}
export const getObjectName = (object_id: string, salt?: string): string => {
  const salted = CryptoJS.SHA1(salt || "default").toString();
  return path.join(salted, object_id).replaceAll(/\\/g, "/");
}

export const createFileClient = (config?: any) => {
  if (!config) {
    config = {
      apiKey: `${minioConfig.accessKey}:${minioConfig.secretKey}`,
      host: minioConfig.endpoint + (minioConfig?.port ? `:${minioConfig.port}` : ""),
      parameters: {
        bucketName: minioConfig.bucketName,
        region: minioConfig.region,
        useSSL: minioConfig.useSSL
      }
    }
  }
  if (!config?.host) {
    throw new Error("缺少文件上传地址")
  }
  if (!config?.apiKey) {
    throw new Error("缺少文件上传API密钥")
  }
  if (!config?.parameters?.bucketName) {
    throw new Error("缺少文件上传存储空间名称")
  }
  return new MinioApi(config);
}
