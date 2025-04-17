import BaseController from "./BaseController";
import { resultError, resultSuccess } from "@/common/resultFormat";
import { Context } from "koa";
import fs from "fs";
import FileLogService from "@/service/FileLogService";
import { StatusEnum } from "@/constants/DataMap";
import { createFileClient, getObjectName, getObjectPath } from "@/common/file";
import path from "path";
import { UPLOAD_FILE_SIZE_LIMIT, UPLOAD_FILE_TYPE } from "@/config/file.conf";

/**
 * 文件-接口
 **/
class FileController extends BaseController {
    // 获取上传URL
    static async getUploadUrl(ctx: Context) {
        const { object_id } = ctx.params;
        const { name, size, mimetype } = ctx.request.query;
        // 初始化文件上传客户端
        const fileClient = createFileClient();
        let uploadUrl = "";
        try {
            if (!object_id) {
                throw new Error("缺少对象ID参数");
            }
            const objectName = getObjectName(object_id, ctx?.userId);
            // 获取上传地址
            uploadUrl = await fileClient.presignedPutObject({ objectName });
            ctx.status = 200;
            // 返回上传地址
            ctx.body = {
                url: uploadUrl,
            };

        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("获取上传地失败", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        } finally {
            // 关闭连接
            ctx.res.once('close', () => {
                try {
                    // 记录文件日志
                    FileLogService.addFileLog({
                        name: name,
                        objectId: object_id,
                        path: fileClient.bucketName,
                        size: size,
                        mimetype: mimetype,
                        userId: ctx.userId,
                        status: uploadUrl ? StatusEnum.ENABLE : StatusEnum.DISABLE
                    })
                } catch (e) {
                    ctx.logger.error("记录文件日志失败", e); // 记录错误日志
                }
            })
        }
    }

    // 上传
    static async upload(ctx: Context) {
        const params: any = ctx.request.body || {};
        // 是否覆盖文件
        const autoOverwrite = params?.autoOverwrite === "true" || params?.autoOverwrite === true;
        // 文件名前缀
        const prefix = params?.prefix || "";

        // 确保 file 是单个文件对象而不是数组
        let files: any;
        if (!ctx.request?.files) {
            throw new Error("文件列表为空");
        }
        // 初始化文件上传客户端
        const fileClient = createFileClient();
        // 返回上传文件的列表
        const resultList = [];
        try {
            const fileField = ctx.request?.files?.file || ctx.request?.files?.files;
            if (fileField) {
                if (Array.isArray(fileField)) {
                    files = fileField;
                } else {
                    files = [fileField];
                }
            }

            if (files?.length < 1) {
                throw new Error("文件为空");
            }

            // 循环判定是否支持文件类型、文件是否存在
            for (const file of files) {
                if (!file) {
                    throw new Error("文件为空");
                }
                // 获取文件名后缀
                const fileExtension = path.extname(file.originalFilename).toLowerCase();
                if (!UPLOAD_FILE_TYPE?.includes(fileExtension)) {
                    throw new Error(`不支持的文件类型: ${file?.originalFilename}`);
                }
                // 判定file大小
                if (!file?.size || file?.size > UPLOAD_FILE_SIZE_LIMIT) {
                    throw new Error(`文件大小超过限制: ${UPLOAD_FILE_SIZE_LIMIT / 1024}MB`);
                }
                // 检查文件是否存在
                if (!file?.filepath || !fs.existsSync(file?.filepath)) {
                    throw new Error("上传的文件不存在");
                }
                let object_id = crypto.randomUUID() + path.extname(file?.originalFilename);
                if (autoOverwrite) {
                    object_id = file?.originalFilename;
                }
                if (prefix) {
                    object_id = path.join(prefix, object_id).replace(/\\/g, '/');
                }

                const objectName = getObjectName(object_id, ctx?.userId);
                console.log("上传文件中...", objectName)

                try {
                    const result = await fileClient.fPutObject(
                        {
                            objectName: objectName,
                            filePath: file.filepath,
                            metaData: {
                                'Content-Type': file.mimetype
                            }
                        }
                    );
                    if (result) {
                        FileLogService.addFileLog({
                            name: file.originalFilename,
                            objectId: object_id,
                            path: fileClient.bucketName,
                            size: file.size,
                            mimetype: file.mimetype,
                            userId: ctx.userId
                        })
                        // const downloadUrl = await fileClient.presignedGetObject({ objectName });
                        // const previewUrl = await fileClient.presignedGetObject({ objectName });
                        resultList.push({
                            id: object_id,
                            filename: file.originalFilename,
                            objectId: object_id,
                            // downloadUrl,
                            // previewUrl
                        });
                    }
                } catch (error) {
                    console.error('上传文件失败：', error);
                }
            }
            if (!resultList?.length) {
                throw new Error("文件未能成功上传，请确认文件是否符合要求。");
            }
            ctx.status = 200;
            ctx.body = resultSuccess({
                data: {
                    list: resultList,
                    total: resultList?.length,
                }
            });

        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("上传文件异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        } finally {
            // 监听接口结束，删除文件
            ctx.res.once("close", () => {
                try {
                    if (files?.length > 0) {
                        const filePaths = files?.map((file: any) => file?.filepath);
                        // 删除原有文件
                        for (const filePath of filePaths) {
                            if (fs.existsSync(filePath)) {
                                fs.unlinkSync(filePath);
                            }
                        }
                    }
                } catch (error) {
                    ctx.logger.error("删除文件异常", error); // 记录错误日志
                }
            });
        }
    }

    // 预览
    static async preview(ctx: Context) {
        const { object_id } = ctx.params;
        const { stream = false } = ctx.query;
        // 初始化文件上传客户端
        const fileClient = createFileClient();
        try {
            if (!object_id) {
                throw new Error("缺少对象ID参数");
            }
            const objectName = getObjectName(object_id, ctx?.userId);
            // 下载文件流
            if (stream) {
                const result = await fileClient.getObjectStream({ objectName });
                ctx.status = 200;
                ctx.body = result;
                return
            }
            const result = await fileClient.presignedGetObject({ objectName });
            ctx.status = 200;
            ctx.body = {
                url: result,
            }
        }
        catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("文件预览异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }
    // 下载
    static async download(ctx: Context) {
        const { object_id } = ctx.params;
        const { stream = false } = ctx.query;
        // 初始化文件上传客户端
        const fileClient = createFileClient();
        try {
            if (!object_id) {
                throw new Error("缺少对象ID参数");
            }
            const objectName = getObjectName(object_id, ctx?.userId);
            // 下载文件流
            if (stream) {
                const result = await fileClient.getObjectStream({ objectName });
                ctx.status = 200;
                ctx.body = result;
                return
            }
            const result = await fileClient.presignedGetObject({ objectName });
            ctx.status = 200;
            ctx.body = {
                url: result,
            }
        }
        catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("文件下载异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }

    // 下载文件
    static async deleteFile(ctx: Context) {
        const { object_id } = ctx.params;
        if (!object_id) {
            throw new Error("缺少文件ID参数");
        }
        try {
            const fileClient = createFileClient();
            const result = await fileClient.deleteObject({ objectName: getObjectName(object_id, ctx?.userId) });
            ctx.status = 200;
            ctx.body = resultSuccess({
                data: result
            });
        } catch (e) {
            ctx.logger.error("文件删除异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }


    // 获取文件列表
    static async queryFileList(ctx: Context) {
        const { req_path = "", nextMarker = "" } = ctx.query;
        // 初始化文件上传客户端
        const fileClient = createFileClient();
        try {
            const userPath = getObjectPath("", ctx?.userId)?.replaceAll("\\", "/");
            // 获取对象路径前缀
            const prefix = getObjectPath(req_path as string || "/", ctx?.userId);
            // 拼接路径前缀
            const marker = nextMarker ? path.join("/", userPath, nextMarker as string) : undefined;
            // 请求文件列表
            const result = await fileClient.queryObjectList({ prefix: prefix, marker: marker });
            // 替换实际路径前缀为相对路径前缀
            if (result?.objects.length > 0) {
                result.objects = result.objects.map(item => {
                    const newItem: any = { ...item }
                    if (item?.prefix) {
                        newItem.isDir = true
                        newItem.name = item?.prefix;
                        delete newItem.prefix;
                    }
                    newItem.name = newItem?.name?.replace(userPath, "");
                    newItem.id = newItem.name;
                    return newItem
                })
            }
            // 返回用户路径前缀替换后的结果
            if (result?.nextMarker) {
                result.nextMarker = result.nextMarker.replace(userPath, "");
            }
            ctx.status = 200;
            ctx.body = resultSuccess({
                data: {
                    list: result?.objects || [],
                    nextMarker: result?.nextMarker,
                    prefix: req_path,
                }
            })
        }
        catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("文件列表查询异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }

}

export default FileController;
