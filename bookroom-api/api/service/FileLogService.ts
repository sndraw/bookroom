import FileLogModel from "@/models/FileLogModel";
import { v4 as uuidv4 } from 'uuid';
import { StatusEnum } from "@/constants/DataMap";


class FileLogService {

    // 查询文件日志列表
    static async queryFileLogList(params: any) {
        const { query } = params
        const list: any = await FileLogModel.findAll({
            where: {
                ...(query || {})
            }
        })

        if (!list || list?.length < 1) {
            return []
        }
        return list
    }

    // 查询文件日志详情
    static async getFileLogById(id: string) {
        if (!id) {
            return null;
        }
        const modelInfo = await FileLogModel.findByPk(id)
        if (!modelInfo) {
            return null;
        }
        return modelInfo
    }

    // 添加文件日志
    static async addFileLog(params: any) {
        // 生成uuid
        const uuid = uuidv4();
        const result = await FileLogModel.create({
            id: uuid,
            name: params?.name || "",
            objectId:params?.objectId,
            path: params?.path || "",
            size: params?.size || 0,
            mimetype: params?.mimetype || "",
            userId: params?.userId || 0,
            status: params?.status || StatusEnum.DISABLE,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
        });
        return result
    }

    // 更新文件日志
    static async updateFileLog(params: any) {
        const { id, ...data } = params
        const result = await FileLogModel.update(
            {
                ...(data || {}),
                updatedAt: new Date().getTime(),
            },
            {
                where: {
                    id: id,
                }
            }
        );

        if (!result) {
            throw new Error("文件日志不存在或已删除");
        }
        return result
    }

    // 删除文件日志
    static async deleteFileLogById(id: string) {
        id = id.trim();
        if (!id) {
            throw new Error("ID不能为空");
        }
        // 删除文件日志在数据库中的记录
        const deleteResult = await FileLogModel.destroy({
            where: {
                id: id,
            },
        });

        if (!deleteResult) {
            throw new Error("文件日志不存在或已删除");
        }

        return deleteResult
    }
}

export default FileLogService