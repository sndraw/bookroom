import { v4 as uuidv4 } from 'uuid';
import { StatusEnum } from "@/constants/DataMap";
import AgentModel from '@/models/AgentModel';
import PlatformService from './PlatformService';
import ToolCallApi from '@/SDK/agent/tool_call';
import { Tool } from '@/SDK/agent/tool/typings';
import SearchTool from '@/SDK/agent/tool/SearchTool';
import WeatherTool from '@/SDK/agent/tool/WeatherTool';
import GraphDBTool from '@/SDK/agent/tool/GraphDBTool';
import { getOrderArray } from '@/utils/query';
import Think from '@/SDK/agent/tool_call/think';
import AgentTool from '@/SDK/agent/tool/AgentTool';
import TimeTool from '@/SDK/agent/tool/TimeTool';
import UrlTool from '@/SDK/agent/tool/UrlTool';
import FileTool from '@/SDK/agent/tool/FileTool';
import { SEARCH_API_MAP } from '@/common/search';
import CustomSearchTool from '@/SDK/agent/tool/CustomSearchTool';


class AgentService {

    // 查询智能助手列表
    static async queryAgentList(params: any) {
        const { query, sorter } = params;
        const list: any = await AgentModel.findAll({
            where: {
                ...(query || {}),
            },
            order: getOrderArray(sorter)
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
    static async agentChat(agent_id: string, params: any, think: Think) {
        const { query, userId, isMemory } = params
        try {
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

            const { parameters, messages } = agentInfo;
            if (!parameters) {
                throw new Error("智能助手参数配置错误");
            }
            const { prompt, isMemory, limitSteps, limitSeconds, maxTokens, searchEngine, weatherEngine, modelConfig, graphConfig, agentSDK } = parameters;
            const tools: Tool[] = [
                // 添加时间工具
                new TimeTool(),
                // 添加URL处理工具
                new UrlTool(),
                // 添加文件存储工具
                new FileTool({ userId }),
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
                let searchList: string[] = []
                // 如果是字符串,则转换成数组
                if (typeof searchEngine === "string") {
                    searchList = searchEngine.split(',').map(item => item.trim());
                }
                // 是否是数组
                if (Array.isArray(searchEngine)) {
                    searchList = [...searchEngine]
                }
                // 多个搜索引擎作为输入，需要遍历每个搜索引擎并获取其配置
                if (searchList.length > 0) {
                    for (const searchId of searchList) {
                        // 获取搜索引擎配置
                        const searchEngineConfig: any = await PlatformService.findPlatformByIdOrName(searchId, {
                            safe: false
                        });
                        // 确保配置中有engine字段，根据code生成引擎标识
                        const configData = searchEngineConfig?.toJSON();
                        // 如果搜索引擎配置中code为customSearch，则使用CustomSearchApi
                        if (configData.code === SEARCH_API_MAP.CustomSearch) {
                            tools.push(new CustomSearchTool(configData));
                        } else {
                            if (configData) {
                                // 如果没有engine字段，则根据code字段创建，首字母大写
                                if (configData.code && !configData.engine) {
                                    configData.engine = configData.code.charAt(0).toUpperCase() + configData.code.slice(1);
                                    console.log(`[AgentService] 生成引擎标识: ${configData.engine}`);
                                }
                            }
                            // 搜索引擎
                            tools.push(new SearchTool(configData));
                        }

                    }
                }
            }
            if (weatherEngine) {
                // 获取天气搜索引擎配置
                const weatherEngineConfig: any = await PlatformService.findPlatformByIdOrName(weatherEngine, {
                    safe: false
                });
                // 搜索引擎
                tools.push(new WeatherTool(weatherEngineConfig?.toJSON()));
            }
            if (agentSDK) {
                let agentList: string[] = []
                // 如果是字符串,则转换成数组
                if (typeof agentSDK === "string") {
                    agentList = agentSDK.split(',').map(item => item.trim());
                }
                // 是否是数组
                if (Array.isArray(agentSDK)) {
                    agentList = [...agentSDK]
                }
                // 多个智能体作为输入，需要遍历每个智能体并获取其配置
                if (agentList.length > 0) {
                    for (const agentId of agentList) {
                        // 获取智能接口配置
                        const agentSDKConfig: any = await PlatformService.findPlatformByIdOrName(agentId, {
                            safe: false
                        });
                        // 智能接口
                        tools.push(new AgentTool({
                            ...agentSDKConfig?.toJSON(),
                            userId
                        }));
                    }
                }
            }
            // 工具调用API配置
            const toolcallApiOps = { ...lmPlatformConfig?.toJSON(), limitSeconds }
            // 问题处理参数
            const questionChatParams = {
                model: modelConfig.model,
                prompt,
                historyMessages: messages,
                isMemory,
                limitSteps,
                limitSeconds,
                maxTokens,
                ...params,
            };
            // 工具调用
            const result = await new ToolCallApi(toolcallApiOps, think).questionChat(questionChatParams, { tools });
            // 结束思考
            think.end();
            return result;
        } catch (e: any) {
            const errorMsg = `处理问题时出错: ${e.message}`;
            think.log(errorMsg);
            // 结束思考
            think.end();
            return errorMsg;
        }
    }
}

export default AgentService