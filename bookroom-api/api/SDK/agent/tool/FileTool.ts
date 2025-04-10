import { createFileClient, getObjectName } from "@/common/file";
import { logger } from "@/common/logger";
interface FileInput {
    // 操作类型
    action: string;
    // 文件名称/ID
    objectId?: string;
    // 文件存储地址
    filePath?: string;
    // 文件类型
    mimetype?: string;
    // 是否流式返回结果
    stream?: boolean,
    // 超时时间，单位为毫秒
    timeout?: number,
}

export const FileActionMap = {
    getObjectData: {
        value: "getObjectData",
        text: "获取对象数据"
    },
    // getObjectStream: {
    //     value: "getObjectStream",
    //     text: "获取对象流"
    // },
    fPutObject: {
        value: "fPutObject",
        text: "上传对象"
    },
    // putObjectStream: {
    //     value: "putObjectStream",
    //     text: "上传对象流"
    // },
    presignedPutObject: {
        value: "presignedPutObject",
        text: "获取预签名上传地址"
    },
    presignedGetObject: {
        value: "presignedGetObject",
        text: "获取预签名下载地址"
    }
}
export const FileActionArray = Object.values(FileActionMap).map(item => item.value);
// export const FileActionEnum= Object.entries(FileActionMap).map(([key, value]) => [value.value, key]);

class FileTool {
    private config: any;
    public name = "file_tool";
    public version = "1.0";
    public description = `
    API for file storage  | 文件存储工具 | 可以通过该API与文件存储系统进行交互\n
    如果需要上传文件，请参考以下示例步骤：\n
    1. 先根据需求，定义一个带有完整<文件后缀>及<当前时间戳>，该<文件名>将作为接下来步骤中的输入参数，输入时请务必保持一致性。\n
    2. 文件名格式: <名称>_<当前时间戳>.<文件后缀> \n
    3. 通过定义的<文件名>作为输入参数调用<文件存储工具>获取<预签名上传地址>。\n
    4. 然后调用<URL工具>，使用<预签名上传地址>，按照指定格式上传内容。\n
    5. 如果上传失败，请处理错误信息后，重新获取<预签名上传地址>再次尝试上传，最大重试次数为3次。\n
    6. 最后调用<URL工具>通过定义的<文件名>作为输入参数获取<预签名下载地址>，获取成功后将<预签名下载地址>进行格式化输出。\n
    7. 预签名下载地址输出格式：[<文件名>](<预签名下载地址>) \n
    8. 如果获取<预签名下载地址>失败，请处理错误信息后重新获取，最大重试次数为3次。\n
    `;
    public parameters = {
        type: "object",
        properties: {
            action: { type: "string", enum: [...FileActionArray], description: `操作类型，可选值为：${JSON.stringify(FileActionMap)}` },
            objectId: { type: "string", description: "文件名称/ID" },
            filePath: { type: "string", description: "文件所在地址" },
            mimetype: { type: "string", description: "文件类型" },
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
        const { name, description } = config || {}
        if (name) {
            this.name = `${this.name}_${name}`;
        }
        if (description) {
            this.description = `${this.description} | ${description}`;
        }
        this.config = config || {};
    }
    async execute(params: FileInput): Promise<any> {
        const { action, objectId, filePath, mimetype, stream, timeout } = params;
        const { host, apiKey, code, parameters = {}, userId } = this.config;

        // 初始化文件上传客户端
        const fileClient = createFileClient();
        logger.log("初始化文件上传客户端");
        let objectName = null;
        let data: any = null;
        let result: any = null;
        try {
            switch (action) {
                case FileActionMap.getObjectData.value:
                    if (!objectId) {
                        throw new Error("文件内容获取错误：缺少文件名/对象ID参数");
                    }
                    objectName = getObjectName(objectId, userId)
                    logger.log("文件名称", objectName);
                    // 获取文件内容
                    result = await fileClient.getObjectData({
                        objectName,
                        encodingType: "base64"
                    });
                    data = {
                        isError: false,
                        message: "文件内容获取成功",
                        fileData: result?.dataStr || "",
                    }
                    break;
                case FileActionMap.fPutObject.value:
                    if (!objectId) {
                        throw new Error("文件上传错误：缺少文件名/对象ID参数");
                    }
                    objectName = getObjectName(objectId, userId)
                    // 判定文件是否存在
                    if (filePath) {
                        // 上传文件
                        const result = await fileClient.fPutObject(
                            {
                                objectName: objectName,
                                filePath: filePath,
                                metaData: {
                                    'Content-Type': mimetype || "application/octet-stream"
                                }
                            }
                        );
                        data = {
                            isError: false,
                            message: "文件上传成功",
                            content: result,
                            objectId: result?.objectId || ""
                        }
                    } else {
                        data = {
                            isError: true,
                            message: "文件路径不能为空"
                        }
                    }
                    break;
                case FileActionMap.presignedGetObject.value:
                    if (!objectId) {
                        throw new Error("预签名下载地址获取错误：缺少文件名/对象ID参数");
                    }
                    objectName = getObjectName(objectId, userId)
                    // 获取预签名下载地址
                    result = await fileClient.presignedGetObject({
                        objectName,
                        expires: 60 // 设置预签名地址的有效期为1分钟
                    });
                    data = {
                        isError: false,
                        message: "预签名下载地址获取成功",
                        fileUrl: result,
                    }
                    break;
                case FileActionMap.presignedPutObject.value:
                    if (!objectId) {
                        throw new Error("预签名上传地址获取错误：缺少文件名/对象ID参数");
                    }
                    objectName = getObjectName(objectId, userId)
                    // 获取预签名上传地址
                    result = await fileClient.presignedPutObject({
                        objectName,
                        expires: 60 // 设置预签名地址的有效期为1分钟
                    });
                    data = {
                        isError: false,
                        message: "预签名上传地址获取成功",
                        fileUrl: result,
                    }
                    break;
                default:
                    data = {
                        isError: true,
                        code: 404,
                        message: "API暂不支持。",
                    }
            }
        } catch (error: any) {
            data = {
                isError: true,
                code: 500,
                message: `工具使用错误：${error?.message || '未知'}`,
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
export default FileTool;