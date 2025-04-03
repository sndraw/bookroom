import LlmModel from "@/models/LlmModel";
import PlatformService from "./PlatformService";
import { StatusEnum } from "@/constants/DataMap";
import { getOrderArray } from "@/utils/query";
import { LLM_TYPE_MAP } from "@/common/llm";
import { v4 as uuidv4 } from 'uuid';


class LlmService {

    // 查询AI模型列表
    static async queryLlmList(params: any, safe: boolean = true) {
        const { platform, query = {}, sorter } = params
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
        const list: any = await LlmModel.findAll({
            where: {
                ...(query || {}),
                platformId: platformConfig.id
            },
            order: getOrderArray(sorter),
        })

        if (!list || list?.length < 1) {
            return []
        }

        const modelList = list.map((item: any) => {
            const values = item?.dataValues || item;
            if (item?.type) {
                values.typeName = Object.values(LLM_TYPE_MAP).find((typeItem: any) => typeItem.value === item?.type)?.text;
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
    static async getLlm(params: any, safe: boolean = true) {
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
        const modelInfo = (await LlmModel.findOne({
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
            newModelInfo.typeName = Object.values(LLM_TYPE_MAP).find((typeItem: any) => typeItem.value === newModelInfo?.type)?.text;
        }
        return newModelInfo
    }

    // 添加AI模型
    static async addLlm(params: any) {
        const { platform, name } = params
        if (!platform) {
            throw new Error("平台不能为空");
        }
        if (!name) {
            throw new Error("名称不能为空");
        }

        // 获取平台
        const platformConfig: any = await PlatformService.findPlatformByIdOrName(platform, {
            safe: false
        });
        if (!platformConfig) {
            throw new Error("平台不存在");
        }
        const data = {
            platformId: platformConfig.id,
            name: params?.name || "",
            model: params?.model || params?.name,
            type: params?.type || LLM_TYPE_MAP.TG.value,
            parameters: params?.parameters || '', // 添加参数配置
            status: params?.status || StatusEnum.ENABLE,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
        }
        // 判定数据唯一性
        const unique = await LlmModel.judgeUnique(data);
        if (!unique) {
            throw new Error("模型名称已存在");
        }
        const result = await LlmModel.create({
            id: uuidv4(),
            ...data,
        });
        return result
    }

    // 更新AI模型
    static async updateLlm(params: any) {
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

        const llm = await LlmModel.findOne({
            where: {
                platformId: platformConfig?.id,
                name: model
            }
        });

        if (!llm) {
            throw new Error("模型不存在");
        }
        llm.setAttributes({
            ...params,
            updatedAt: new Date().getTime(),
        });
        const llmInfo = llm.toJSON();
        // 判定数据唯一性
        const unique = await LlmModel.judgeUnique(llmInfo, llmInfo.id);

        if (!unique) {
            throw new Error("模型名称已存在");
        }

        const result = await llm.save();

        return result
    }
    // 修改AI模型状态
    static async updateLlmStatus(params: any) {
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
        const llm = await LlmModel.findOne({
            where: {
                platformId: platformConfig?.id,
                name: model
            }
        });

        if (!llm) {
            throw new Error("模型不存在");
        }
        llm.setAttributes({
            status,
            updatedAt: new Date().getTime(),
        });
        const result = await llm.save();
        return result
    }

    // 删除AI模型
    static async deleteLlm(params: any) {
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
        const deleteResult = await LlmModel.destroy({
            where: {
                platformId: platformConfig.id,
                name: model,
            },
        });

        if (!deleteResult) {
            throw new Error("AI模型不存在或已删除");
        }

        return deleteResult
    }
}

export default LlmService