import { v4 as uuidv4 } from 'uuid';
import { StatusEnum } from "@/constants/DataMap";
import AgentModel from '@/models/AgentModel';
import PlatformService from './PlatformService';
import ToolCallApi from '@/SDK/agent/tool_call';
import { Tool } from '@/SDK/agent/tool/typings';
import SearchTool from '@/SDK/agent/tool/SearchTool';
import WeatherTool from '@/SDK/agent/tool/WeatherTool';
import GraphDBTool from '@/SDK/agent/tool/GraphDBTool';


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
    static async getAgentById(agent: string, where: any = {}) {
        if (!agent) {
            throw new Error("ID不能为空");
        }
        return await AgentModel.findOne({
            where: {
                id: agent,
                ...where,
            },
        });
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
        const { agent_id } = params
        const data = {
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
        if (!agent_id) {
            throw new Error("参数错误");
        }

        try {
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
        const { query } = params
        if (!agent_id || !query) {
            throw new Error("参数错误");
        }
        const agent = await AgentModel.findByPk(agent_id);
        if (!agent) {
            throw new Error("智能助手不存在或已删除");
        }
        // 查询Agent
        const agentRes = await AgentService.getAgentById(agent_id);
        if (!agentRes) {
            throw new Error("未找到指定的智能助手");
        }

        const agentInfo = agentRes.toJSON();

        const { parameters } = agentInfo;
        if (!parameters) {
            throw new Error("智能助手参数配置错误");
        }
        const { prompt, searchEngine, modelConfig, graphConfig } = parameters;
        const tools: Tool[] = [
            WeatherTool
        ]

        if (!modelConfig || !modelConfig.platform || !modelConfig.model) {
            throw new Error("模型配置错误")
        }
        // 获取模型平台配置
        const lmPlatformConfig: any = await PlatformService.findPlatformByIdOrName(modelConfig?.platform, {
            safe: false
        });
        if (!lmPlatformConfig) {
            throw new Error("模型平台不存在");
        }
        if (graphConfig && graphConfig?.graph) {
            // 获取图数据库配置
            const graphDbConfig: any = await PlatformService.findPlatformByIdOrName(graphConfig?.graph, {
                safe: false
            });
            if (!graphDbConfig) {
                throw new Error("知识图谱不存在");
            }
            tools.push(new GraphDBTool(graphDbConfig?.toJSON() || {}, graphConfig?.workspace || ''));
        }
        if (searchEngine) {
            // 获取搜索引擎配置
            const searchEngineConfig: any = await PlatformService.findPlatformByIdOrName(searchEngine, {
                safe: false
            });
            tools.push(new SearchTool(searchEngineConfig?.toJSON()));
        }

        const result = await new ToolCallApi(lmPlatformConfig?.toJSON()).questionChat({
            model: modelConfig.model,
            prompt,
            ...params,
        }, tools);

        if (result?.isError) {
            throw new Error(result.content)
        }
        return result
    }
}

export default AgentService