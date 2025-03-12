import { Context } from "koa";
import { resultError, resultSuccess } from "@/common/resultFormat";
import BaseController from "./BaseController";
import PlatformService from "@/service/PlatformService";
import AgentService from "@/service/AgentService"; 
import { PLATFORM_TYPE_MAP } from "@/common/platform";

class AgentController extends BaseController {
    // 获取-全部来源-智能助手-列表
    static async queryAllAILmList(ctx: Context) {
        const { platform, ...query } = ctx.query;
        try {
            let platformList: any = []
            let models: any = [];
            if (!platform) {
                const platformInfoList = await PlatformService.queryActivedRecords({
                    type: PLATFORM_TYPE_MAP.model.value
                });
                platformList = platformInfoList.map((item: any) => {
                    return item.name
                })
            } else {
                platformList.push(platform)
            }
            for (const platformItem of platformList) {
                const platformModels: any = await AgentService.queryAgentList({
                    platform: platformItem,
                    query
                });
                models = models.concat(platformModels);
            }
            ctx.status = 200;
            ctx.body = resultSuccess({
                data: {
                    list: models
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
        const { platform } = ctx.params;
        try {
            const agentList = await PlatformService.queryActivedRecords({
                type: PLATFORM_TYPE_MAP.agent.value
            });
            ctx.status = 200;
            ctx.body = resultSuccess({
                data: agentList
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
        const { agent } = ctx.params;
        ctx.verifyParams({
            agent: {
                type: "string",
                required: false,
                min: 4,
                max: 255,
                message: {
                    required: "Agent名称不能为空",
                    min: "Agent名称不能小于4",
                    max: "Agent名称不能超过255",
                }
            }
        }, {
            agent
        })
        try {
            // 查询Agent
            const result = await PlatformService.findPlatformByIdOrName(agent, {
                safe: true
            });
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

}

export default AgentController;