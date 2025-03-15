import { StatusEnum } from "@/constants/DataMap";
import { AI_LM_PLATFORM_MAP, AI_LM_TYPE_MAP } from "@/common/ai";
import OllamaAPI from "../SDK/ollama";
import OpenAIAPI from "../SDK/openai";
import PlatformService from "./PlatformService";


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

        const modelList = list.map((item: any) => {
            const values = item?.dataValues || item;
            if (item?.modified_at) {
                values.updatedAt = item?.modified_at
            }
            if (item?.type) {
                values.typeName = Object.values(AI_LM_TYPE_MAP).find((typeItem: any) => typeItem.value === item?.type)?.text;
            }
            values.platform = platformConfig?.name;
            values.platformId = platformConfig?.id;
            values.platformCode = platformConfig?.code

            if (!safe) {
                values.platformHost = platformConfig?.host
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

        modelInfo.platform = platform
        modelInfo.platformId = platformConfig?.id
        modelInfo.platformCode = platformConfig?.code
        if (!safe) {
            modelInfo.platformHost = platformConfig?.host
        }
        if (modelInfo?.modified_at) {
            modelInfo.updatedAt = modelInfo?.modified_at
        }
        if (modelInfo?.type) {
            modelInfo.typeName = Object.values(AI_LM_TYPE_MAP).find((typeItem: any) => typeItem.value === modelInfo?.type)?.text;
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
            presence_penalty
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
        if(prompt){
            // 加到数组顶部
            messages.unshift({
                role: "system",
                content: prompt
            });
        }

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
                    is_stream
                });
                break;
            case AI_LM_PLATFORM_MAP.openai.value:
                return await new OpenAIAPI(platformConfig?.toJSON()).getAILmChat({
                    model: model,
                    messages: messages,
                    temperature: temperature,
                    top_p: top_p,
                    max_tokens: max_tokens,
                    is_stream
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
        const { platform, model, prompt, images, is_stream, } = params
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
                });
                break;
            case AI_LM_PLATFORM_MAP.openai.value:
                return await new OpenAIAPI(platformConfig?.toJSON()).getAILmGenerate({
                    model,
                    prompt,
                    images,
                    is_stream,
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
        const { platform, model, input } = params
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
                });
                break;
            case AI_LM_PLATFORM_MAP.openai.value:
                return await new OpenAIAPI(platformConfig?.toJSON()).getAILmEmbeddings({
                    model,
                    input
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
        const { platform, model, prompt, is_stream, quality, response_format, style, size, n } = params

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
                    n
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