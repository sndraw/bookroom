import { Context } from "koa";
import { resultError, resultSuccess } from "@/common/resultFormat";
import BaseController from "./BaseController";
import PlatformService from "@/service/PlatformService";
import AgentService from "@/service/AgentService";
import { PLATFORM_TYPE_MAP } from "@/common/platform";
import { StatusEnum } from "@/constants/DataMap";

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
        const { agent_id } = ctx.params;
        if (!agent_id) {
            throw new Error("缺少智能助手ID参数");
        }
        try {
            // 查询Agent
            const result = await AgentService.getAgentById(agent_id);
            if (!result) {
                throw new Error("未找到指定的Agent");
            }
            ctx.status = 200;
            ctx.body = resultSuccess({
                data: result
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
                min: 4,
                max: 40,
                message: {
                    required: "平台名称不能为空",
                    min: "平台名称长度不能小于4",
                    max: "平台名称长度不能超过40",
                }
            },
            name: {
                type: "string",
                required: false,
                min: 4,
                max: 255,
                message: {
                    required: "智能助手名称不能为空",
                    min: "智能助手名称不能小于4",
                    max: "智能助手名称不能超过255",
                }
            }
        }, {
            ...newParams,
        })
        try {
            const result = await AgentService.addAgent({
                ...newParams
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
                min: 4,
                max: 40,
                message: {
                    required: "平台名称不能为空",
                    min: "平台名称长度不能小于4",
                    max: "平台名称长度不能超过40",
                }
            },
            agent_id: {
                type: "string",
                required: true,
                min: 4,
                max: 255,
                message: {
                    required: "智能助手ID不能为空",
                    min: "智能助手ID长度不能小于4",
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
                ...params
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
                min: 4,
                max: 40,
                message: {
                    required: "平台名称不能为空",
                    min: "平台名称长度不能小于4",
                    max: "平台名称长度不能超过40",
                }
            },
            agent_id: {
                type: "string",
                required: true,
                min: 4,
                max: 255,
                message: {
                    required: "智能助手不能为空",
                    min: "智能助手长度不能小于4",
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
                min: 4,
                max: 40,
                message: {
                    required: "平台名称不能为空",
                    min: "平台名称长度不能小于4",
                    max: "平台名称长度不能超过40",
                }
            },
            agent_id: {
                type: "string",
                required: true,
                min: 4,
                max: 255,
                message: {
                    required: "智能助手不能为空",
                    min: "智能助手ID长度不能小于4",
                    max: "智能助手ID长度不能超过255",
                }
            },
        }, {
            platform,
            agent_id
        })
        try {
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
}

export default AgentController;