import { v4 as uuidv4 } from 'uuid';
import { StatusEnum } from "@/constants/DataMap";
import AgentModel from '@/models/AgentModel';
import PlatformService from './PlatformService';
import TavilyAPI from '@/SDK/tavily';
import { SEARCH_API_MAP } from '@/common/search';

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
        const { agent_id } = params
        if (agent_id) {
            // 获取模型信息
            const AgentInfo = await AgentModel.findByPk(agent_id);
            if (AgentInfo) {
                // 更新日志
                const result = await this.updateAgent(agent_id, params);
                return result;
            }
            return null;
        }
        // 添加日志
        const result = await this.addAgent(params);
        return result;
    }


    // 添加智能助手
    static async addAgent(params: any) {
        const { agent_id, platformId } = params
        if (!platformId) {
            throw new Error("参数错误");
        }
        // 获取平台
        const platformConfig: any = await PlatformService.findPlatformById(platformId, {
            safe: false
        });
        if (!platformConfig) {
            throw new Error("接口名称不存在");
        }
        const data = {
            platformId: platformConfig?.id,
            name: params?.name || "",
            description: params?.description || "",
            type: params?.type || 1,
            parameters: params?.parameters || {},
            messages: params?.messages || [],
            userId: params?.userId || 0,
            status: params?.status || StatusEnum.ENABLE,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
        }
        // 判定数据唯一性
        const unique = await AgentModel.judgeUnique(data);
        if (!unique) {
            throw new Error("名称已存在");
        }
        const result = await AgentModel.create({
            id: agent_id || uuidv4(),
            ...data,
        });
        return result
    }
    // 更新智能助手
    static async updateAgent(agent_id: string, params: any) {
        const { platformId } = params
        if (!agent_id) {
            throw new Error("参数错误");
        }

        try {
            if (platformId) {
                // 获取平台
                const platformConfig: any = await PlatformService.findPlatformById(platformId, {
                    safe: false
                });
                if (!platformConfig) {
                    throw new Error("接口名称不存在");
                }
            }
            const agent = await AgentModel.findByPk(agent_id);

            if (!agent) {
                throw new Error("智能助手不存在");
            }
            agent.setAttributes({
                ...params,
                updatedAt: new Date().getTime(),
            });
            // 判定数据唯一性
            const unique = await AgentModel.judgeUnique(agent.toJSON(), agent_id);

            if (!unique) {
                throw new Error("名称已存在");
            }

            const result = await agent.save();
            return result;
        }
        catch (e) {
            const error: any = e;
            throw error;
        }
    }
    // 更新智能助手状态
    static async updateAgentStatus(agent_id: string, status: number) {
        if (!agent_id) {
            throw new Error("参数错误");
        }
        const result = await AgentModel.update(
            {
                status,
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
    // 更新智能助手消息记录
    static async updateAgentMessages(agent_id: string, messages: any) {

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

    // 智能助手对话
    static async agentChat(agent_id: string, params: any) {
        const { platformId, query, stream } = params
        if (!agent_id || !platformId || !query) {
            throw new Error("参数错误");
        }
        const agent = await AgentModel.findByPk(agent_id);
        if (!agent) {
            throw new Error("智能助手不存在或已删除");
        }
        // 获取平台
        const platformConfig: any = await PlatformService.findPlatformById(platformId, {
            safe: false
        });
        if (!platformConfig) {
            throw new Error("接口名称不存在");
        }

        // 查询Agent
        const result = await AgentService.getAgentById(agent_id);
        if (!result) {
            throw new Error("未找到指定的智能助手");
        }

        const data = result.toJSON();

        const { parameters } = data;
        if (!parameters) {
            throw new Error("智能助手参数配置错误");
        }
        const { searchEngine } = parameters;
        let response: any;

        if (searchEngine) {
            // 获取搜索引擎配置
            const searchEngineConfig: any = await PlatformService.findPlatformByIdOrName(searchEngine, {
                safe: false
            });
            const queryParams = {
                query: query, // 查询内容
                max_results: 10
            }
            switch (searchEngineConfig?.code) {
                case SEARCH_API_MAP.tavily.value:
                    response = await new TavilyAPI({
                        host: searchEngineConfig?.host,
                        apiKey: searchEngineConfig?.apiKey,
                    }).search(queryParams);
                    break;
                default:
                    break;
            }
        }

        return response

    }
}

export default AgentService