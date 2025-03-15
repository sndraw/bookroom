import minioConfig from "@/config/minio.conf"

import MinioApi from "@/SDK/minio";

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
