import { v4 as uuidv4 } from 'uuid';
import { StatusEnum } from "@/constants/DataMap";
import AgentModel from '@/models/AgentModel';
import PlatformService from './PlatformService';

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
    static async getAgentById(agent: string) {
        if (!agent) {
            throw new Error("ID不能为空");
        }
        return await AgentModel.findByPk(agent)
    }

    // 添加或者更新智能助手
    static async addOrUpdateAgent(params: any) {
        const { agentId, platform } = params
        if (!platform) {
            throw new Error("平台参数错误");
        }
        if (agentId) {
            // 获取模型信息
            const AgentInfo = await AgentModel.findByPk(agentId);
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
        const { agentId, platform } = params
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
        const data = {
            platform: platformConfig?.id,
            name: params?.name || "",
            type: params?.type || 1,
            paramters: params?.paramters || {},
            messages: params?.messages || [],
            userId: params?.userId || 0,
            status: params?.status || StatusEnum.DISABLE,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
        }
        // 判定数据唯一性
        const unique = await AgentModel.judgeUnique(data);
        if (!unique) {
            throw new Error("名称已存在");
        }
        const result = await AgentModel.create({
            id: agentId || uuidv4(),
            ...data,
        });
        return result
    }

    // 更新智能助手
    static async updateAgent(params: any) {
        const { agentId, platform } = params
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
        const data = {
            platform: platformConfig?.id,
            type: params?.type || 1,
            paramters: params?.paramters || {},
            messages: params?.messages || [],
            userId: params?.userId || 0,
            status: params?.status || StatusEnum.DISABLE,
            updatedAt: new Date().getTime(),
        }
        // 判定数据唯一性
        const unique = await AgentModel.judgeUnique({
            id: agentId,
            data
        });
        if (!unique) {
            throw new Error("名称已存在");
        }
        const result = await AgentModel.update({
            data,
        },
            {
                where: {
                    id: agentId,
                }
            }
        );

        if (!result) {
            throw new Error("智能助手不存在或已删除");
        }
        return result
    }
    // 修改智能助手状态
    static async updateAgentStatus(params: any) {
        const { platform, agentId, status } = params
        if (!platform) {
            throw new Error("参数错误");
        }
        if (!agentId) {
            throw new Error("参数错误");
        }
        // 获取平台
        const platformConfig: any = await PlatformService.findPlatformByIdOrName(platform, {
            safe: false
        });
        if (!platformConfig) {
            throw new Error("平台不存在");
        }
        const result = await AgentModel.update(
            {
                status,
                updatedAt: new Date().getTime(),
            },
            {
                where: {
                    id: agentId,
                }
            }
        );

        if (!result) {
            throw new Error("智能助手不存在或已删除");
        }
        return result
    }
    // 删除智能助手
    static async deleteAgentById(agentId: string) {
        if (!agentId) {
            throw new Error("ID不能为空");
        }
        return await AgentModel.destroy({
            where: {
                id: agentId,
            },
        })
    }
}

export default AgentService