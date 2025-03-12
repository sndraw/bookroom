import AILmModel from "@/models/AILmModel";
import { AI_LM_TYPE_MAP } from "@/common/ai";
import PlatformService from "./PlatformService";
import { StatusEnum } from "@/constants/DataMap";


class AILmService {

    // 查询AI模型列表
    static async queryAILmList(params: any, safe: boolean = true) {
        const { platform, query } = params
        if (!platform) {
            throw new Error("参数错误");
        }
        // 获取平台
        const platformConfig: any = await PlatformService.findPlatformByIdOrName(platform, {
            safe: false
        });
        if (!platformConfig) {
            throw new Error("平台不存在");
        }
        const list: any = await AILmModel.findAll({
            where: {
                ...query,  // 查询条件
                platform_id: platformConfig.id
            }
        })

        if (!list || list?.length < 1) {
            return []
        }

        const modelList = list.map((item: any) => {
            const values = item?.dataValues || item;
            if (item?.type) {
                values.typeName = Object.values(AI_LM_TYPE_MAP).find((typeItem: any) => typeItem.value === item?.type)?.text;
            }
            values.platform = platformConfig?.name;
            values.platformId = platformConfig?.id;
            values.platformCode = platformConfig?.code;
            if (!safe) {
                values.platformHost = platformConfig?.host;
            }
            return values
        })

        return modelList
    }

    // 查询AI模型
    static async getAILm(params: any, safe: boolean = true) {
        const { platform, model } = params
        if (!platform) {
            throw new Error("参数错误");
        }
        if (!model) {
            throw new Error("参数错误");
        }
        // 获取平台
        const platformConfig: any = await PlatformService.findPlatformByIdOrName(platform, {
            safe: false
        });


        if (!platformConfig) {
            throw new Error("平台不存在");
        }
        const modelInfo = (await AILmModel.findOne({
            where: {
                name: model,
                platformId: platformConfig.id
            }
        }))?.toJSON();
        const newModelInfo = { ...modelInfo } as any;

        newModelInfo.platform = platform
        newModelInfo.platformId = platformConfig?.id
        newModelInfo.platformCode = platformConfig?.code
        if (!safe) {
            newModelInfo.platformHost = platformConfig?.host
        }

        if (newModelInfo?.type) {
            newModelInfo.typeName = Object.values(AI_LM_TYPE_MAP).find((typeItem: any) => typeItem.value === newModelInfo?.type)?.text;
        }
        return newModelInfo
    }

    // 添加AI模型
    static async addAILm(params: any) {
        const { platform, model } = params
        if (!platform) {
            throw new Error("参数错误");
        }
        if (!model) {
            throw new Error("参数错误");
        }
        // 获取平台
        const platformConfig: any = await PlatformService.findPlatformByIdOrName(platform, {
            safe: false
        });
        if (!platformConfig) {
            throw new Error("平台不存在");
        }
        const result = await AILmModel.create({
            platformId: platformConfig.id,
            name: params?.name || model,
            model: model,
            size: params?.size || 0,
            type: params?.type || AI_LM_TYPE_MAP.llm.value,
            paramsConfig: params?.paramsConfig || '', // 添加参数配置
            status: params?.status || StatusEnum.ENABLE,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
        });
        return result
    }

    // 更新AI模型
    static async updateAILm(params: any) {
        const { platform, model } = params
        if (!platform) {
            throw new Error("参数错误");
        }
        if (!model) {
            throw new Error("参数错误");
        }
        // 获取平台
        const platformConfig: any = await PlatformService.findPlatformByIdOrName(platform, {
            safe: false
        });
        if (!platformConfig) {
            throw new Error("平台不存在");
        }
        const result = await AILmModel.update(
            {
                name: params?.name || model,
                size: params?.size || 0,
                type: params?.type || AI_LM_TYPE_MAP.llm.value,
                paramsConfig: params?.paramsConfig || '', // 添加参数配置
                updatedAt: new Date().getTime(),
            },
            {
                where: {
                    platformId: platformConfig.id,
                    model,
                }
            }
        );

        if (!result) {
            throw new Error("AI模型不存在或已删除");
        }


        return result
    }
    // 修改AI模型状态
    static async updateAILmStatus(params: any) {
        const { platform, model, status } = params
        if (!platform) {
            throw new Error("参数错误");
        }
        if (!model) {
            throw new Error("参数错误");
        }
        // 获取平台
        const platformConfig: any = await PlatformService.findPlatformByIdOrName(platform, {
            safe: false
        });
        if (!platformConfig) {
            throw new Error("平台不存在");
        }
        const result = await AILmModel.update(
            {
                status,
                updatedAt: new Date().getTime(),
            },
            {
                where: {
                    platformId: platformConfig.id,
                    model,
                }
            }
        );

        if (!result) {
            throw new Error("AI模型不存在或已删除");
        }
        return result
    }

    // 删除AI模型
    static async deleteAILm(params: any) {
        const { platform, model } = params
        if (!platform) {
            throw new Error("参数错误");
        }
        if (!model) {
            throw new Error("参数错误");
        }
        // 获取平台
        const platformConfig: any = await PlatformService.findPlatformByIdOrName(platform, {
            safe: false
        });
        if (!platformConfig) {
            throw new Error("平台不存在");
        }
        // 删除AI模型在数据库中的记录
        const deleteResult = await AILmModel.destroy({
            where: {
                platformId: platformConfig.id,
                model: model,
            },
        });

        if (!deleteResult) {
            throw new Error("AI模型不存在或已删除");
        }

        return deleteResult
    }
}

export default AILmService