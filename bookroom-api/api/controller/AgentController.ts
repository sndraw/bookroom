import { Context } from "koa";
import { resultError, resultSuccess } from "@/common/resultFormat";
import BaseController from "./BaseController";
import PlatformService from "@/service/PlatformService";
import AgentService from "@/service/AgentService";
import { PLATFORM_TYPE_MAP } from "@/common/platform";
import { StatusEnum } from "@/constants/DataMap";
import TavilyAPI from "@/SDK/tavily";
import { responseStream } from "@/utils/streamHelper";
import AIChatLogService from "@/service/AIChatLogService";
import { AGENT_API_MAP } from "@/common/agent";

class AgentController extends BaseController {
    // 获取-全部来源-智能助手-列表
    static async queryAllAgentList(ctx: Context) {
        const { platform, ...query } = ctx.query;
        try {
            let platformList: any = []
            let agents: any = [];
            if (!platform) {
                const platformInfoList = await PlatformService.queryActivedRecords({
                    type: PLATFORM_TYPE_MAP.agent.value
                });
                platformList = platformInfoList.map((item: any) => {
                    return item.name
                })
            } else {
                platformList.push(platform)
            }
            for (const platformItem of platformList) {
                const platformModels: any = await AgentService.queryAgentList({
                    platformId: platformItem.id,
                    query
                });
                agents = agents.concat(platformModels);
            }
            ctx.status = 200;
            ctx.body = resultSuccess({
                data: {
                    list: agents
                }
            });
        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("查询智能助手列表异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }
    // 获取智能助手列表
    static async queryAgentList(ctx: Context) {
        // 从路径获取参数
        const { platform, query } = ctx.params;
        try {
            if (!platform) {
                throw new Error("参数错误");
            }
            // 获取平台
            const platformConfig: any = await PlatformService.findPlatformByIdOrName(platform, {
                safe: false
            })
            if (!platformConfig) {
                throw new Error("平台不存在");
            }

            // 查询智能助手列表
            const agentList = await AgentService.queryAgentList({
                platformId: platformConfig.id,
                query,
            });

            ctx.status = 200;
            ctx.body = resultSuccess({
                data: {
                    list: agentList
                }
            });
        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("查询Agent列表异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }

    // 获取智能助手信息
    static async getAgentInfo(ctx: Context) {
        // 从路径获取参数
        const { platform, agent_id } = ctx.params;
        if (!platform) {
            throw new Error("参数错误");
        }
        if (!agent_id) {
            throw new Error("参数错误");
        }
        try {
            // 获取平台
            const platformConfig: any = await PlatformService.findPlatformByIdOrName(platform, {
                safe: false
            });
            if (!platformConfig) {
                throw new Error("平台不存在");
            }

            // 查询Agent
            const result = await AgentService.getAgentById(agent_id);
            if (!result) {
                throw new Error("未找到指定的智能助手");
            }
            const data = result.toJSON();
            // 返回结果
            ctx.status = 200;
            ctx.body = resultSuccess({
                data
            });
        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("查询Agent信息异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }

    /**
     * 添加智能助手
     * @param {Object} ctx 上下文对象，包含请求和响应信息
     * @returns {Object} 返回响应体，包含成功或错误信息
     */
    static async addAgent(ctx: Context) {
        // 从路径获取参数
        const { platform } = ctx.params;
        let params: any = ctx.request.body;
        if (typeof params === 'string') {
            // 将字符串转换为对象
            params = JSON.parse(params);
        }
        const newParams = {
            ...params,
            platform
        }
        ctx.verifyParams({
            platform: {
                type: "string",
                required: true,
                min: 2,
                max: 40,
                message: {
                    required: "平台名称不能为空",
                    min: "平台名称长度不能小于2",
                    max: "平台名称长度不能超过40",
                }
            },
            name: {
                type: "string",
                required: false,
                min: 2,
                max: 255,
                message: {
                    required: "智能助手名称不能为空",
                    min: "智能助手名称不能小于2",
                    max: "智能助手名称不能超过255",
                }
            }
        }, {
            ...newParams,
        })
        try {
            const result = await AgentService.addAgent({
                ...newParams,
                userId: ctx?.userId
            });
            if (!result) {
                throw new Error("添加失败"); // 抛出异常，便于后续处理
            }

            ctx.status = 200;
            ctx.body = resultSuccess({
                data: "ok"
            });

        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("智能助手添加异常：", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code || error?.status_code,
                message: error?.message || error,
            });
        }
    }

    /**
     * 修改智能助手信息
     * @param {Object} ctx 上下文对象，包含请求和响应信息
     * @returns {Object} 返回响应体，包含成功或错误信息
     */
    static async changeAgentInfo(ctx: Context) {

        // 从路径获取参数
        const { platform, agent_id } = ctx.params;
        const params: any = ctx.request.body;
        const newParams = {
            ...params,
            platform,
            agent_id
        }
        ctx.verifyParams({
            platform: {
                type: "string",
                required: true,
                min: 2,
                max: 40,
                message: {
                    required: "平台名称不能为空",
                    min: "平台名称长度不能小于2",
                    max: "平台名称长度不能超过40",
                }
            },
            agent_id: {
                type: "string",
                required: true,
                min: 2,
                max: 255,
                message: {
                    required: "智能助手ID不能为空",
                    min: "智能助手ID长度不能小于2",
                    max: "智能助手ID长度不能超过255",
                }
            }
        }, {
            ...newParams
        })
        try {
            const record = await AgentService.updateAgent({
                platform,
                agent_id,
                ...params,
                userId: ctx?.userId,
            });

            if (!record) {
                throw new Error("智能助手信息修改失败");
            }
            ctx.body = resultSuccess({
                data: "ok"
            });
        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("智能助手信息修改异常：", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code || error?.status_code,
                message: error?.message || error,
            });
        }
    }

    /**
   * 修改智能助手状态
   * @param {Object} ctx 上下文对象，包含请求和响应信息
   * @returns {Object} 返回响应体，包含成功或错误信息
   */
    static async changeAgentStatus(ctx: Context) {

        // 从路径获取参数
        const { platform, agent_id } = ctx.params;
        const params: any = ctx.request.body;
        const newParams = {
            ...params,
            platform,
            agent_id
        }
        ctx.verifyParams({
            platform: {
                type: "string",
                required: true,
                min: 2,
                max: 40,
                message: {
                    required: "平台名称不能为空",
                    min: "平台名称长度不能小于2",
                    max: "平台名称长度不能超过40",
                }
            },
            agent_id: {
                type: "string",
                required: true,
                min: 2,
                max: 255,
                message: {
                    required: "智能助手不能为空",
                    min: "智能助手长度不能小于2",
                    max: "智能助手长度不能超过255",
                }
            },
            status: {
                type: "enum",
                required: true,
                convertType: "int",
                values: [StatusEnum.ENABLE, StatusEnum.DISABLE],
                message: {
                    required: "状态不能为空",
                    type: "状态不合法"
                },
            },
        }, {
            ...newParams
        })

        try {
            const record = await AgentService.updateAgentStatus(newParams);

            if (!record) {
                throw new Error("智能助手状态修改失败");
            }
            ctx.body = resultSuccess({
                data: "ok"
            });
        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("智能助手状态修改异常：", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code || error?.status_code,
                message: error?.message || error,
            });
        }
    }

    // 删除智能助手
    static async deleteAgent(ctx: Context) {
        // 从路径获取参数
        const { platform, agent_id } = ctx.params;
        ctx.verifyParams({
            platform: {
                type: "string",
                required: true,
                min: 2,
                max: 40,
                message: {
                    required: "平台名称不能为空",
                    min: "平台名称长度不能小于2",
                    max: "平台名称长度不能超过40",
                }
            },
            agent_id: {
                type: "string",
                required: true,
                min: 2,
                max: 255,
                message: {
                    required: "智能助手不能为空",
                    min: "智能助手ID长度不能小于2",
                    max: "智能助手ID长度不能超过255",
                }
            },
        }, {
            platform,
            agent_id
        })
        try {
            // 获取平台
            const platformConfig: any = await PlatformService.findPlatformByIdOrName(platform, {
                safe: false
            });
            if (!platformConfig) {
                throw new Error("平台不存在");
            }
            if (!agent_id) {
                throw new Error("ID参数错误");
            }
            const result = await AgentService.deleteAgentById(agent_id);
            if (!result) {
                throw new Error("删除智能助手失败");
            }
            ctx.status = 200;
            ctx.body = resultSuccess({
                data: result
            });
        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("删除智能助手异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }

    static async agentChat(ctx: Context) {
        // 从路径获取参数
        const { platform, agent_id } = ctx.params;
        let params: any = ctx.request.body;
        if (typeof params === 'string') {
            // 将字符串转换为对象
            params = JSON.parse(params);
        }
        const newParams = {
            platform,
            agent_id,
            ...params
        }
        ctx.verifyParams({
            platform: {
                type: "string",
                required: true,
                min: 2,
                max: 40,
                message: {
                    required: "平台名称不能为空",
                    min: "平台名称长度不能小于2",
                    max: "平台名称长度不能超过40",
                }
            },
            agent_id: {
                type: "string",
                required: true,
                min: 2,
                max: 255,
                message: {
                    required: "智能助手不能为空",
                    min: "智能助手长度不能小于2",
                    max: "智能助手长度不能超过255",
                }
            },
            is_stream: {
                type: "boolean",
                required: false,
                default: true,
                message: {
                    required: "是否流式返回不能为空",
                    type: "是否流式返回类型错误"
                }
            },
            query: {
                type: "string",
                required: true,
                message: {
                    required: "查询内容不能为空"
                }
            }
        }, {
            ...newParams
        });
        // 查询参数
        let queryParams = {};
        // 回复文本
        let responseText: any = '';

        try {
            const { is_stream, query } = newParams;
            queryParams = {
                platform,
                agent_id,
                stream: !!is_stream, // 是否流式返回数据
                query: query, // 查询内容
            }
            const dataStream = await AgentService.agentChat(queryParams);
            if (is_stream) {
                responseText = await responseStream(ctx, dataStream);
                return;
            }
            responseText = dataStream?.response || dataStream || '';
            ctx.status = 200;
            ctx.body = resultSuccess({
                data: responseText
            });

        } catch (e: any) {
            // 异常处理，返回错误信息
            ctx.logger.error("知识图谱对话异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e?.error || e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error || '',
            });
            responseText = error?.message || '';
        } finally {
            ctx.res.once('close', () => {
                // 添加聊天记录到数据库
                AIChatLogService.addAIChatLog({
                    platform,
                    model: PLATFORM_TYPE_MAP.agent.value,
                    type: 1,
                    input: JSON.stringify(queryParams), // 将请求参数转换为JSON字符串
                    output: responseText || '', // 确保响应文本不为空字符串
                    userId: ctx?.userId, // 假设ctx中包含用户ID
                    status: StatusEnum.ENABLE
                });
            })
        }
    }
}

export default AgentController;