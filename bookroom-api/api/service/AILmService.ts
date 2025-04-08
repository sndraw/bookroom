import { StatusEnum } from "@/constants/DataMap";
import { AI_LM_PLATFORM_MAP } from "@/common/ai";
import OllamaAPI from "../SDK/ollama";
import OpenAIAPI from "../SDK/openai";
import PlatformService from "./PlatformService";
import { LLM_FLAG_MAP, LLM_TYPE_MAP } from "@/common/llm";
import { v4 as uuidv4 } from 'uuid';
import LlmModel from "@/models/LlmModel";
import { getOrderArray } from "@/utils/query";


class AILmService {

    // 查询AI模型列表
    static async queryAILmList(params: any, safe: boolean = true) {
        const { platform, query, sorter } = params
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
        let list: any;
        switch (platformConfig?.code) {
            case AI_LM_PLATFORM_MAP.ollama.value:
                list = await new OllamaAPI(platformConfig?.toJSON()).queryAILmAndStatusList(query);
                break;
            case AI_LM_PLATFORM_MAP.openai.value:
                list = await new OpenAIAPI(platformConfig?.toJSON()).queryAILmList(query);
                break;
            default:
                list = []
                break;
        }
        if (!list || list?.length < 1) {
            return []
        }
        // 查询自定义模型列表
        const llmList = await LlmModel.findAll({
            where: {
                ...(query || {}),
                platformId: platformConfig.id,
            },
            order: getOrderArray(sorter),
        })
        if (llmList && llmList.length > 0) {
            for (const item of llmList) {
                const values = item.toJSON()
                list.push({
                    flag: LLM_FLAG_MAP.USER.value,
                    ...values
                });
            }
        }

        const modelList = list.map((item: any) => {
            const modelInfo = item?.dataValues || item;
            if (item?.modified_at) {
                modelInfo.updatedAt = item?.modified_at
            }
            modelInfo.platform = platformConfig?.name;
            modelInfo.platformId = platformConfig?.id;
            modelInfo.platformCode = platformConfig?.code

            if (!safe) {
                modelInfo.platformHost = platformConfig?.host
            }

            return modelInfo
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
        let modelInfo: any;
        switch (platformConfig?.code) {
            case AI_LM_PLATFORM_MAP.ollama.value:
                modelInfo = await new OllamaAPI(platformConfig?.toJSON()).getAILmAndStatusInfo(model);
                break;
            case AI_LM_PLATFORM_MAP.openai.value:
                modelInfo = await new OpenAIAPI(platformConfig?.toJSON()).getAILmInfo(model);
                break;
            default:
                modelInfo = {}
                break;
        }
        const llm = await LlmModel.findOne({
            where: {
                platformId: platformConfig?.id,
                name: model
            }
        });
        if (!modelInfo) {
            modelInfo = {}
        }
        if (llm) {
            const llmInfo = llm.toJSON();
            Object.assign(modelInfo, {
                ...llmInfo,
                flag: LLM_FLAG_MAP.USER.value,
            });
        }
        modelInfo.platform = platform
        modelInfo.platformId = platformConfig?.id
        modelInfo.platformCode = platformConfig?.code
        if (!safe) {
            modelInfo.platformHost = platformConfig?.host
        }
        if (modelInfo?.modified_at) {
            modelInfo.updatedAt = modelInfo?.modified_at
        }
        return modelInfo
    }

    // 下载AI模型
    static async pullAILm(params: any) {
        const { platform, model, is_stream } = params
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
        let result: any;
        switch (platformConfig?.code) {
            case AI_LM_PLATFORM_MAP.ollama.value:
                return await new OllamaAPI(platformConfig?.toJSON()).pullAILm({ model: model, is_stream });
                break;
            default:
                result = ""
                break;
        }

        return result
    }


    // 启动AI模型
    static async runAILm(params: any) {
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
        let result: any;
        switch (platformConfig?.code) {
            case AI_LM_PLATFORM_MAP.ollama.value:
                const modelInfo = await new OllamaAPI(platformConfig?.toJSON()).getAILmAndStatusInfo(model);
                if (status === StatusEnum.ENABLE && modelInfo?.status === StatusEnum.ENABLE) {
                    throw new Error(`${model}模型已启动`);
                }
                if (status === StatusEnum.DISABLE && modelInfo?.status === StatusEnum.DISABLE) {
                    throw new Error(`${model}模型已停止`);
                }
                if (status === StatusEnum.DISABLE) {
                    result = await new OllamaAPI(platformConfig?.toJSON()).stopAILm({ model });
                    // 延迟500毫秒返回
                    await new Promise(resolve => setTimeout(resolve, 500));
                } else {
                    result = await new OllamaAPI(platformConfig?.toJSON()).runAImodel({ model });
                }
                break;
            default:
                result = ""
                break;
        }

        return result
    }

    // 添加AI模型
    static async addAILm(params: any) {
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
        let modelInfo: any;
        switch (platformConfig?.code) {
            case AI_LM_PLATFORM_MAP.ollama.value:
                modelInfo = await new OllamaAPI(platformConfig?.toJSON()).getAILmAndStatusInfo(name);
                break;
            case AI_LM_PLATFORM_MAP.openai.value:
                modelInfo = await new OpenAIAPI(platformConfig?.toJSON()).getAILmInfo(name);
                break;
            default:
                modelInfo = {}
                break;
        }
        if (modelInfo) {
            throw new Error("模型已存在");
        }
        const data = {
            platformId: platformConfig.id,
            name: params?.name || "",
            model: params?.name || "",
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
    static async updateAILm(params: any) {
        const { platform, model } = params
        if (!platform) {
            throw new Error("平台不能为空");
        }
        if (!model) {
            throw new Error("名称不能为空");
        }
        // 获取平台
        const platformConfig: any = await PlatformService.findPlatformByIdOrName(platform, {
            safe: false
        });
        if (!platformConfig) {
            throw new Error("平台不存在");
        }
        let modelInfo: any;
        switch (platformConfig?.code) {
            case AI_LM_PLATFORM_MAP.ollama.value:
                modelInfo = await new OllamaAPI(platformConfig?.toJSON()).getAILmAndStatusInfo(model);
                break;
            case AI_LM_PLATFORM_MAP.openai.value:
                modelInfo = await new OpenAIAPI(platformConfig?.toJSON()).getAILmInfo(model);
                break;
            default:
                modelInfo = {}
                break;
        }
        if (modelInfo) {
            throw new Error("非自定义模型，无法更新");
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
        if (params?.name) {
            params.model = params.name;
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

        let result: any;
        switch (platformConfig?.code) {
            case AI_LM_PLATFORM_MAP.ollama.value:
                result = await new OllamaAPI(platformConfig?.toJSON()).deleteAILm({ model: model });
                break;
            default:
                result = ""
                break;
        }
        const llm = await LlmModel.findOne({
            where: {
                platformId: platformConfig?.id,
                name: model
            }
        });
        if (llm) {
            result = await llm.destroy();
        }

        return result
    }


    // 对话AI模型
    static async chatAILm(params: any) {
        const {
            platform,
            model,
            prompt,
            messages,
            is_stream,
            temperature,
            top_k,
            top_p,
            max_tokens,
            repeat_penalty,
            frequency_penalty,
            presence_penalty,
            limitSeconds,
            userId = null
        } = params
        if (!platform) {
            throw new Error("参数错误");
        }
        if (!model) {
            throw new Error("参数错误");
        }
        if (!messages || !Array.isArray(messages)) {
            throw new Error("参数错误");
        }
        // 获取平台
        const platformConfig: any = await PlatformService.findPlatformByIdOrName(platform, {
            safe: false
        });
        if (!platformConfig) {
            throw new Error("平台不存在");
        }
        // 加到数组顶部
        messages.unshift({
            role: "system",
            content: prompt || "You are a helpful assistant."
        });
        let result: any;
        switch (platformConfig?.code) {
            case AI_LM_PLATFORM_MAP.ollama.value:
                return await new OllamaAPI(platformConfig?.toJSON()).getAILmChat({
                    model: model,
                    messages: messages,
                    temperature: temperature,
                    top_k: top_k,
                    top_p: top_p,
                    num_predict: max_tokens,
                    repeat_penalty,
                    frequency_penalty,
                    presence_penalty,
                    is_stream,
                    userId
                });
                break;
            case AI_LM_PLATFORM_MAP.openai.value:
                return await new OpenAIAPI({
                    ...platformConfig?.toJSON(),
                    limitSeconds,
                }).getAILmChat({
                    model: model,
                    messages: messages,
                    temperature: temperature,
                    top_k: top_k,
                    top_p: top_p,
                    max_tokens: max_tokens,
                    repetition_penalty: repeat_penalty,
                    frequency_penalty,
                    presence_penalty,
                    is_stream,
                    userId
                });
                break;
            default:
                result = ""
                break;
        }
        return result
    }


    // 对话补全
    static async generateAILm(params: any) {
        const { platform, model, prompt, images, is_stream, limitSeconds, userId = null, ...resparams } = params
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

        let result: any;
        switch (platformConfig?.code) {
            case AI_LM_PLATFORM_MAP.ollama.value:
                return await new OllamaAPI(platformConfig?.toJSON()).getAILmGenerate({
                    model,
                    prompt,
                    images,
                    is_stream,
                    userId,
                    ...resparams
                });
                break;
            case AI_LM_PLATFORM_MAP.openai.value:
                const messages: any[] = [
                    {
                        role: "system",
                        content: [{ type: "text", text: "You are a helpful assistant." }],
                    },
                    {
                        role: "user",
                        content: [{ type: "text", text: prompt || "" }],
                        images: images
                    }
                ];

                return await new OpenAIAPI({
                    ...platformConfig?.toJSON(),
                    limitSeconds,
                }).getAILmChat({
                    model,
                    messages,
                    is_stream,
                    userId,
                    ...resparams
                })
                break;
            default:
                result = ""
                break;
        }
        return result
    }


    // 生成嵌入向量
    static async embeddingVector(params: any) {
        const { platform, model, input, encoding_format, dimensions, truncate, userId = null } = params
        if (!platform) {
            throw new Error("参数错误");
        }
        if (!model) {
            throw new Error("参数错误");
        }
        if (!input) {
            throw new Error("参数错误");
        }
        // 获取平台
        const platformConfig: any = await PlatformService.findPlatformByIdOrName(platform, {
            safe: false
        });
        if (!platformConfig) {
            throw new Error("平台不存在");
        }

        let result: any;
        switch (platformConfig?.code) {
            case AI_LM_PLATFORM_MAP.ollama.value:
                return await new OllamaAPI(platformConfig?.toJSON()).getAILmEmbeddings({
                    model,
                    input,
                    truncate,
                    userId
                });
                break;
            case AI_LM_PLATFORM_MAP.openai.value:
                return await new OpenAIAPI(platformConfig?.toJSON()).getAILmEmbeddings({
                    model,
                    input,
                    dimensions,
                    encoding_format,
                    userId
                })
                break;
            default:
                result = ""
                break;
        }
        return result
    }

    // 生成图片
    static async generateImage(params: any) {
        const { platform, model, prompt, is_stream, quality, response_format, style, size, n, userId = null } = params

        if (!platform) {
            throw new Error("参数错误");
        }
        if (!model) {
            throw new Error("参数错误");
        }
        if (!prompt) {
            throw new Error("参数错误");
        }
        // 获取平台
        const platformConfig: any = await PlatformService.findPlatformByIdOrName(platform, {
            safe: false
        });
        if (!platformConfig) {
            throw new Error("平台不存在");
        }

        let result: any;
        switch (platformConfig?.code) {
            case AI_LM_PLATFORM_MAP.ollama.value:
                throw new Error("API未实现");
                break;
            case AI_LM_PLATFORM_MAP.openai.value:
                return await new OpenAIAPI(platformConfig?.toJSON()).getAILmImageGenerate({
                    model,
                    prompt,
                    is_stream,
                    quality,
                    response_format,
                    style,
                    size,
                    n,
                    userId
                })
                break;
            default:
                result = ""
                break;
        }
        return result
    }
}

export default AILmService