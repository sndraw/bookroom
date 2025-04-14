import AIChatLogModel from "@/models/AIChatLogModel";
import { v4 as uuidv4 } from 'uuid';
import { StatusEnum } from "@/constants/DataMap";
import PlatformService from "./PlatformService";
import { getOrderArray } from "@/utils/query";


class AIChatLogService {

    // 查询AI对话日志列表
    static async queryAIChatLogList(params: any) {
        const { query,sorter} = params
        const list: any = await AIChatLogModel.findAll({
            where: {
                ...(query || {})
            },
            order: getOrderArray(sorter),
        })

        if (!list || list?.length < 1) {
            return []
        }
        return list
    }

    // 查询AI对话日志详情
    static async getAIChatLogById(id: string) {
        if (!id) {
            throw new Error("ID不能为空");
        }
        return await AIChatLogModel.findByPk(id)
    }


    // 添加AI对话日志
    static async addAIChatLog(params: any) {
        try {
            const { platform, model } = params
            if (!platform) {
                throw new Error("平台参数错误");
            }
            // 获取平台
            const platformConfig: any = await PlatformService.findPlatformByIdOrName(platform, {
                safe: false
            });
            if (!platformConfig) {
                throw new Error("平台不存在");
            }
            let input = params?.input || "";
            // 如果output是对象格式，转换为字符串格式
            if (typeof input === 'object') {
                input = JSON.stringify(input);
            }
            let output = params?.output || "";
            // 如果output是对象格式，转换为字符串格式
            if (typeof output === 'object') {
                output = JSON.stringify(output);
            }
            const result = await AIChatLogModel.create({
                id: params?.id || uuidv4(),
                chat_id: params?.chat_id || uuidv4(),
                platformId: platformConfig?.id,
                model: model || "",
                chat_type: params?.chat_type || "",
                input: input,
                output: output,
                userId: params?.userId || 0,
                status: params?.status || StatusEnum.ENABLE,
                createdAt: new Date().getTime(),
                updatedAt: new Date().getTime(),
            });
            return result
        } catch (error) {
            console.error("添加AI对话日志失败", error); // 记录错误日志
            throw error;
        }
    }
    // 删除AI对话日志
    static async deleteAIChatLogById(id: string) {
        // 删除AI对话日志在数据库中的记录
        const deleteResult = await AIChatLogModel.destroy({
            where: {
                id
            },
        });

        if (!deleteResult) {
            throw new Error("AI对话日志不存在或已删除");
        }

        return deleteResult
    }
}

export default AIChatLogService