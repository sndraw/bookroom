import AgentLogModel from "@/models/AgentLogModel";
import { v4 as uuidv4 } from 'uuid';
import { StatusEnum } from "@/constants/DataMap";
import { getOrderArray } from "@/utils/query";


class AgentLogService {

    // 查询智能助手日志列表
    static async queryAgentLogList(params: any) {
        const { query,sorter} = params
        const list: any = await AgentLogModel.findAll({
            where: {
                ...(query || {})
            },
            order: getOrderArray(sorter)
        })

        if (!list || list?.length < 1) {
            return []
        }
        return list
    }

    // 查询智能助手日志详情
    static async getAgentLogById(id: string) {
        if (!id) {
            throw new Error("ID不能为空");
        }
        return await AgentLogModel.findByPk(id)
    }


    // 添加智能助手日志
    static async addAgentLog(params: any) {
        try {
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
            const result = await AgentLogModel.create({
                id: params?.id || uuidv4(),
                agentId: params?.agentId || uuidv4(),
                input: input,
                output: output,
                userId: params?.userId || 0,
                status: params?.status || StatusEnum.ENABLE,
                createdAt: new Date().getTime(),
                updatedAt: new Date().getTime(),
            });
            return result
        } catch (error) {
            console.error("添加智能助手日志失败", error); // 记录错误日志
            throw error;
        }
    }
    // 删除智能助手日志
    static async deleteAgentLogById(id: string) {
        // 删除智能助手日志在数据库中的记录
        const deleteResult = await AgentLogModel.destroy({
            where: {
                id
            },
        });

        if (!deleteResult) {
            throw new Error("智能助手日志不存在或已删除");
        }

        return deleteResult
    }
}

export default AgentLogService