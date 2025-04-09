
import { Client } from "minio";
import { ObjectMetaData } from "minio/dist/main/internal/type";
import mimeTypes from "mime-types";


class MinioApi {

    private readonly minioClient: any;
    private readonly parameters: any | null = null;
    public readonly bucketName: string | null = null;

    constructor(ops: any) {
        const { apiKey, host, parameters } = ops;
        // 拆分apiKey
        const apiKeyArr = apiKey.split(":");
        if (apiKeyArr.length !== 2) throw new Error("API Key格式不正确");

        // 如果parameters不为空且为字符串格式，需要解析成JSON格式
        if (parameters && typeof parameters === "string") {
            try {
                ops.parameters = JSON.parse(parameters);
            } catch (e) {
                throw new Error("参数配置解析失败，请检查格式是否正确");
            }
        }
        // 如果parameters是对象格式，直接赋值给this.parameters
        if (parameters && typeof parameters === "object") {
            this.parameters = parameters;
        }
        if (parameters?.bucketName) {
            this.bucketName = parameters.bucketName;
        }
        const hostObj: any = {
            endPoint: undefined,
            port: undefined
        }
        try {
            // 判定是否开头为http或https
            if (host.startsWith("http://") || host.startsWith("https://")) {
                const publicURL = new URL(host)
                hostObj.endPoint = publicURL.hostname
                hostObj.port = publicURL.port ? parseInt(publicURL.port) : undefined
            } else {
                hostObj.endPoint = host?.split(":")[0]
                if (host.includes(':')) {
                    hostObj.port = parseInt(host.split(":")[1])
                }
            }
        } catch (error) {
            console.error("解析文件上传地址失败:", error);
            throw new Error("文件上传地址格式不正确");
        }
        const clientConfig = {
            endPoint: hostObj?.endPoint,
            port: hostObj?.port,
            accessKey: apiKeyArr[0],
            secretKey: apiKeyArr[1],
            region: parameters.region,
            useSSL: parameters.useSSL,
        }
        try {
            // 初始化minio客户端
            this.minioClient = new Client(clientConfig)
            console.log("minio连接成功:", host);
        } catch (error) {
            console.error("minio连接失败:", error);
            throw error;
        }

    }

    async getObjectStream(
        params: {
            objectName: string;
            bucketName?: string;
        }
    ) {
        try {
            const { objectName, bucketName = this.bucketName } = params;;
            if (!objectName) {
                throw new Error("objectName不能为空");
            }
            const stream = await this.minioClient.getObject(bucketName, objectName);
            return stream;
        } catch (error) {
            console.error("获取对象流失败:", error);
            throw error;
        }
    };


    async getObjectData(
        params: {
            objectName: string;
            bucketName?: string;
            encodingType?: string;
            addFileType?: boolean;
        }
    ) {
        try {
            const { objectName, bucketName = this.bucketName, encodingType = "base64", addFileType = false } = params;;

            if (!objectName) {
                throw new Error("objectName不能为空");
            }

            const stream = await this.minioClient.getObject(bucketName, objectName);
            if (!stream) {
                throw new Error("object数据为空");
            }

            // 将流内容读取到内存中
            let dataBuffer = Buffer.alloc(0);
            // 将流内容读取到字符串中
            return new Promise((resolve, reject) => {
                stream.on('data', (chunk: Uint8Array<ArrayBufferLike>) => {
                    dataBuffer = Buffer.concat([dataBuffer, chunk]);
                });

                stream.on('end', async () => {
                    // 从dataBuffer读取到文件类型
                    if (encodingType === "buffer") {
                        resolve(dataBuffer);
                        return;
                    }
                    let dataStr = dataBuffer.toString('base64')
                    const mimeType = mimeTypes.lookup(objectName); // 使用mime-types库自动查找
                    // 添加文件类型到base64字符串中
                    if (addFileType) {
                        if (mimeType) {
                            dataStr = `data:${mimeType};base64,${dataStr}`;
                        } else {
                            dataStr = `data:application/octet-stream;base64,${dataStr}`; // 默认使用二进制流类型
                        }
                    }
                    resolve({
                        dataStr: dataStr,
                        fileType: mimeTypes.extension(mimeType || ""),
                        mimeType: mimeTypes.lookup(objectName), // 使用mime-types库自动查找
                    });
                });

                stream.on('error', (err: any) => {
                    reject(err);
                });
            });
        } catch (error) {
            console.error("获取对象数据失败:", error);
            throw error;
        }
    };

    async fPutObject(
        params: {
            objectName: string;
            bucketName?: string;
            filePath: string;
            metaData?: ObjectMetaData;
        }
    ) {
        try {
            const { objectName, bucketName = this.bucketName, filePath, metaData } = params;;
            const uploadedObjectInfo = await this.minioClient.fPutObject(bucketName, objectName, filePath, metaData);
            console.log("对象上传成功:", objectName);
            return uploadedObjectInfo;
        } catch (error) {
            console.error("对象上传失败:", error);
            throw error;
        }
    };

    async putObjectStream(
        params: {
            objectName: string;
            bucketName?: string;
        },
        stream: any
    ) {
        try {
            const { objectName, bucketName = this.bucketName } = params;
            const uploadedObjectInfo = await this.minioClient.putObject(bucketName, objectName, stream);
            console.log("对象上传成功:", objectName);
            return uploadedObjectInfo;
        } catch (error) {
            console.error("对象上传失败:", error);
            throw error;
        }
    };

    async deleteObject(
        params: {
            objectName: string;
            bucketName?: string;
        }
    ) {
        try {
            const { objectName, bucketName = this.bucketName } = params;
            await this.minioClient.removeObject(bucketName, objectName);
            console.log("对象删除成功:", objectName);
        } catch (error) {
            console.error("对象删除失败:", error);
            throw error;
        }
    };


    async presignedGetObject(
        params: {
            objectName: string;
            bucketName?: string;
            expires?: number;
        }
    ) {
        try {
            const { objectName, bucketName = this.bucketName, expires = 1 * 60 * 60 } = params;

            const url = await this.minioClient.presignedGetObject(bucketName, objectName, expires);
            console.log("预签名下载地址:", url);

            return url;
        } catch (error) {
            console.error("生成预签名下载地址失败:", error);
            throw error;
        }
    };


    async presignedPutObject(
        params: {
            objectName: string;
            bucketName?: string;
            expires?: number;
        }
    ) {
        try {
            const { objectName, bucketName = this.bucketName, expires = 1 * 60 * 60 } = params;

            const url = await this.minioClient.presignedPutObject(bucketName, objectName, expires);
            console.log("预签名上传地址:", url);

            return url;
        } catch (error) {
            console.error("生成预签名上传地址失败:", error);
            throw error;
        }
    };


    async presignedDeleteObject(
        params: {
            objectName: string;
            bucketName?: string;
            expires?: number;
        }
    ) {
        try {
            const { objectName, bucketName = this.bucketName, expires = 1 * 60 * 60 } = params;
            const url = await this.minioClient.presignedUrl("DELETE", bucketName, objectName, expires);
            console.log("预签名URL:", url);

            return url;
        } catch (error) {
            console.error("生成预签名URL失败:", error);
            throw error;
        }
    };
}


export default MinioApi;