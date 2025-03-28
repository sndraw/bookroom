import { Context } from "koa";
import { resultError, resultSuccess } from "@/common/resultFormat";
import BaseController from "./BaseController";
import AgentService from "@/service/AgentService";
import { StatusEnum } from "@/constants/DataMap";
import { responseStream } from "@/utils/streamHelper";
import AgentLogService from "@/service/AgentLogService";

class AgentController extends BaseController {
    // 获取智能助手列表
    static async queryAgentList(ctx: Context) {
        // 从路径获取参数
        const { query } = ctx.params;
        try {
            // 查询智能助手列表
            const agentList = await AgentService.queryAgentList({
                query: {
                    ...query,
                    userId: ctx.userId,
                }
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
        const { agent_id } = ctx.params;
        if (!agent_id) {
            throw new Error("参数错误");
        }
        try {
            // 查询Agent
            const result = await AgentService.getAgentById(agent_id, {
                userId: ctx.userId,
            });
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
        let params: any = ctx.request.body;
        if (typeof params === 'string') {
            // 将字符串转换为对象
            params = JSON.parse(params);
        }
        const newParams = {
            ...params,
            userId: ctx?.userId
        }
        ctx.verifyParams({
            name: {
                type: "string",
                required: true,
                min: 2,
                max: 255,
                message: {
                    required: "智能助手名称不能为空",
                    min: "智能助手名称不能小于2",
                    max: "智能助手名称不能超过255",
                }
            },
            description: {
                type: "string",
                required: false,
                min: 1,
                max: 255,
                message: {
                    required: "描述不能为空",
                    min: "描述长度不能小于1",
                    max: "描述长度不能超过255"
                }
            },
            parameters: {
                type: "object",
                required: false,
                message: {
                    required: "参数不能为空",
                    object: "参数格式非法"
                }
            },
        }, {
            ...newParams,
        })
        try {
            const result = await AgentService.addAgent(newParams);
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
        const { agent_id } = ctx.params;
        const params: any = ctx.request.body;
        const newParams = {
            ...params,
            userId: ctx?.userId
        }
        ctx.verifyParams({
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
            },
            description: {
                type: "string",
                required: false,
                min: 1,
                max: 255,
                message: {
                    required: "描述不能为空",
                    min: "描述长度不能小于1",
                    max: "描述长度不能超过255"
                }
            },
            parameters: {
                type: "object",
                required: false,
                message: {
                    required: "参数不能为空",
                    object: "参数格式非法"
                }
            },
        }, {
            ...newParams
        })
        try {
            if (!agent_id) {
                throw new Error("ID参数错误");
            }
            // 查询是否存在
            const agentInfo = await AgentService.getAgentById(agent_id, {
                userId: ctx?.userId
            });
            if (!agentInfo) {
                throw new Error("智能助手不存在");
            }
            if (agentInfo.getDataValue('userId') !== ctx.userId) {
                throw new Error("无权限修改该智能助手状态");
            }
            agentInfo.setAttributes({
                ...newParams,
                userId: ctx.userId,
                updatedAt: new Date().getTime(),
            });
            await agentInfo.save();
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
        const { agent_id } = ctx.params;
        const params: any = ctx.request.body;
        ctx.verifyParams({
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
            ...params
        })

        try {
            if (!agent_id) {
                throw new Error("ID参数错误");
            }
            // 查询是否存在
            const agentInfo = await AgentService.getAgentById(agent_id, {
                userId: ctx?.userId
            });
            if (!agentInfo) {
                throw new Error("智能助手不存在");
            }
            if (agentInfo.getDataValue('userId') !== ctx.userId) {
                throw new Error("无权限修改该智能助手状态");
            }
            agentInfo.setAttributes({
                status: params.status,
                userId: ctx.userId,
                updatedAt: new Date().getTime(),
            });
            await agentInfo.save();
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
        const { agent_id } = ctx.params;
        try {
            if (!agent_id) {
                throw new Error("ID参数错误");
            }
            // 查询是否存在
            const agentInfo = await AgentService.getAgentById(agent_id, {
                userId: ctx?.userId
            });
            if (!agentInfo) {
                throw new Error("智能助手不存在");
            }
            if (agentInfo.getDataValue('userId') !== ctx.userId) {
                throw new Error("无权限删除该智能助手");
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
        const { agent_id } = ctx.params;
        let params: any = ctx.request.body;
        if (typeof params === 'string') {
            // 将字符串转换为对象
            params = JSON.parse(params);
        }
        const newParams = {
            ...params,
            agent_id,
            userId: ctx.userId,
        }
        ctx.verifyParams({
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
        let queryParams: any = {};
        // 回复文本
        let responseText: any = '';

        try {
            const { is_stream, query } = newParams;
            const agent = await AgentService.getAgentById(agent_id, {
                userId: ctx.userId,
            })
            if (!agent) {
                throw new Error("智能助手不存在或已删除");
            }
            const agentInfo = agent.toJSON();
            queryParams = {
                platformId: agentInfo?.platformId,
                is_stream, // 是否流式返回数据
                query: query, // 查询内容
            }
            const dataStream: any = await AgentService.agentChat(agent_id, queryParams);
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
                AgentLogService.addAgentLog({
                    agentId: agent_id,
                    input: JSON.stringify(queryParams, null, 2) || '',
                    output: responseText,
                    userId: ctx.userId,
                    status: StatusEnum.ENABLE,
                });
            })
        }
    }
}

export default AgentController;