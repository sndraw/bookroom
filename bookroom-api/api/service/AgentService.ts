import AgentModel from "@/models/AgentModel";
import { v4 as uuidv4 } from 'uuid';
import { StatusEnum } from "@/constants/DataMap";

class AgentService {

    // 查询智能助手列表
    static async queryAgentList(params: any) {
        const { query } = params
        const list: any = await AgentModel.findAll({
            where: {
                ...(query || {}),
            }
        })

        if (!list || list?.length < 1) {
            return []
        }
        return list
    }

    // 查询智能助手详情
    static async getAgentById(agent_id: string) {
        if (!agent_id) {
            throw new Error("ID不能为空");
        }
        return await AgentModel.findByPk(agent_id)
    }

    // 添加或者更新智能助手
    static async addOrUpdateAgent(params: any) {
        const { agent_id, platform } = params
        if (!platform) {
            throw new Error("平台参数错误");
        }
        if (agent_id) {
            // 获取模型信息
            const AgentInfo = await AgentModel.findByPk(agent_id);
            if (AgentInfo) {
                // 更新日志
                const result = await this.updateAgent(params);
                return result;
            }
        }
        // 添加日志
        const result = await this.addAgent(params);
        return result;
    }


    // 添加智能助手
    static async addAgent(params: any) {
        const { agent_id, platform } = params
        if (!platform) {
            throw new Error("平台参数错误");
        }
        const result = await AgentModel.create({
            id: agent_id || uuidv4(),
            platform: platform,
            name: params?.name || "",
            type: params?.type || 1,
            paramters: params?.paramters || {},
            messages: params?.messages || [],
            userId: params?.userId || 0,
            status: params?.status || StatusEnum.DISABLE,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
        });
        return result
    }

    // 更新智能助手
    static async updateAgent(params: any) {
        const { agent_id, platform } = params
        if (!platform) {
            throw new Error("平台参数错误");
        }

        const result = await AgentModel.update(
            {
                platform: platform,
                type: params?.type || 1,
                paramters: params?.paramters || {},
                messages: params?.messages || [],
                userId: params?.userId || 0,
                status: params?.status || StatusEnum.DISABLE,
                updatedAt: new Date().getTime(),
            },
            {
                where: {
                    id: agent_id,
                }
            }
        );

        if (!result) {
            throw new Error("智能助手不存在或已删除");
        }
        return result
    }

    // 删除智能助手
    static async deleteAgentById(agent_id: string) {
        if (!agent_id) {
            throw new Error("ID不能为空");
        }
        return await AgentModel.destroy({
            where: {
                id: agent_id,
            },
        })
    }
}

export default AgentService