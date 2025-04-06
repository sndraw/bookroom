import { logger } from "@/common/logger";

interface UrlInput {
    // 文件对象
    file?: Blob | ArrayBuffer | string;
    // 文件类型
    mimetype?: string;
    // 预签名下载地址
    downloadUrl?: string;
    // 预签名上传地址
    uploadUrl?: string;
    // 是否流式返回结果
    stream?: boolean,
    // 超时时间，单位为毫秒
    timeout?: number,
}

class UrlTool {
    private config: any;
    public name = "url_tool";
    public version = "1.0";
    public description = "API for Url | URL工具 | 可以通过该工具通过给定的URL进行文件的上传和下载";
    public parameters = {
        type: "object",
        properties: {
            file: { type: " Blob | ArrayBuffer", description: "文件数据" },
            downloadUrl: { type: "string", description: "下载地址" },
            uploadUrl: { type: "string", description: "上传地址" },
            // stream: { type: "boolean", description: "是否流式返回结果" },
            timeout: { type: "number", description: "超时时间，单位为毫秒" },
        },
        required: ["action"],
    };
    public returns = {
        type: "object",
        properties: {
            content: {
                type: "array",
                items: { type: "object", properties: { text: { type: "string" } }, required: ["text"] }
            },
            isError: { type: "boolean" }
        },
        required: ["content", "isError"]
    };

    constructor(config?: any) {
        const { description } = config || {}
        if (description) {
            this.description = `${this.description} | ${description}`;
        }
        this.config = config || {};
    }
    async execute(params: UrlInput): Promise<any> {
        const { file, mimetype, uploadUrl, downloadUrl, stream, timeout } = params;
        const { host, apiKey, code, parameters = {}, userId } = this.config;
        logger.info(`执行URL操作，上传地址：${uploadUrl}, 下载地址：${downloadUrl}`);
        let data: any = null;
        try {
            let result = null;
            if (uploadUrl) {
                if (!file) {
                    throw new Error("未提供文件");
                }
                let fileData: any = file;
                // 判定文件是否base64编码
                if (typeof file === 'string') {
                    const base64Data = file?.split(',')?.[1];
                    if (base64Data) {
                        fileData = Buffer.from(base64Data, 'base64'); // 解码为二进制数据
                    }
                }
                result = await fetch(uploadUrl, {
                    method: 'PUT',
                    body: fileData, // 使用Blob对象或者二进制数据
                    headers: {
                        'Content-Type': mimetype || 'application/octet-stream',
                    },
                }).catch((error) => {
                    logger.error('上传文件失败', error);
                });
                if (!result?.ok) {
                    throw new Error(`上传文件失败，状态码: ${result?.status}`);
                }
                logger.info('上传文件结果', result);
            }
            if (downloadUrl) {
                result = await fetch(downloadUrl, {
                    method: 'GET',
                }).catch((error) => {
                    logger.error('下载文件失败', error);
                });
                if (!result?.ok) {
                    throw new Error(`下载文件失败，状态码: ${result?.status}`);
                }
                result = await result.text(); // 将响应内容解析为字符串
            }
            if (!result){
                throw new Error('Url地址处理失败');
            }

            data = {
                isError: false,
                content: result
            }
        } catch (error: any) {
            data = {
                isError: true,
                code: 500,
                message: `服务器内部错误：${error?.message || '未知错误'}`,
            }
        }

        if (data && !data?.isError) {
            return {
                content: [{ type: "text", text: `请求结果：${JSON.stringify(data || {}, null, 2)}` }],
                isError: false,
            };
        }
        return {
            content: [
                { type: "text", text: `${data?.message || data?.content || '未知错误'}` },
            ],
            isError: true,
        };
    }
}
export default UrlTool;