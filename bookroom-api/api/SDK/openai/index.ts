import OpenAI from 'openai'
import { StatusEnum } from '@/constants/DataMap';
import { createFileClient, getObjectName } from '@/common/file';
import { VOICE_RECOGNIZE_LANGUAGE_MAP, VOICE_RECOGNIZE_TASK_MAP } from '@/common/voice';
import { ChatCompletionCreateParams } from 'openai/resources/chat';
import { convertMessagesToVLModelInput } from './convert';
import { EmbeddingCreateParams } from 'openai/resources/embeddings';


class OpenAIApi {
    private readonly openai: any;
    private readonly platformId: string = "";

    constructor(ops: any) {
        const { apiKey, host, id } = ops;
        if (!id) throw new Error("缺少平台ID");

        if (id) {
            this.platformId = id;
        }
        this.openai = new OpenAI({
            apiKey: apiKey,
            baseURL: host,
            timeout: 20000,
            maxRetries: 2
        });
    }
    // 获取模型列表
    async queryAILmList(query: any = {}) {
        const where: any = {
            platformId: this.platformId
        }
        if (query?.status) {
            where.status = query.status;
        }
        if (query?.type) {
            where.type = query.type;
        }

        // const modelList = await AILmModel.findAll({
        //   where,
        // });

        const result = await this.openai.models?.list();
        if (!result || !result?.data || result?.data?.length < 1) {
            return []
        }
        const modelList = result.data;
        const newModels = modelList?.map((modelItem: any) => {
            const modelInfo = {
                ...modelItem,
                name: modelItem.id, // 使用id作为name字段
                model: modelItem.id, // 使用id作为model字段
            }
            // 如果created是number类型，但却是秒数，则转换为毫秒
            if (typeof modelItem.created === 'number') {
                if (modelItem.created < 10000000000) {
                    modelInfo.createdAt = modelItem.created * 1000;
                } else {
                    modelInfo.createdAt = modelItem.created;
                }
            }
            return modelInfo
        })
        return newModels;
    }

    // 获取模型详情
    async getAILmInfo(model: string) {
        // const where = {
        //     platformId: this.platformId,
        //     model: model,
        // }
        // const modelInfo = await AILmModel.findOne({
        //   where
        // })
        let modelInfo = null
        try {
            // 如果查询单条报错
            modelInfo = await this.openai.models?.retrieve(model);
        } catch {
            // 查询单条报错，查询所有模型并筛选出指定的模型
            const result = await this.openai.models?.list();
            if (!result || !result?.data || result?.data?.length < 1) {
                modelInfo = null;
            } else {
                const modelList = result.data;
                modelInfo = modelList.find((item: { id: string; }) => item.id === model);
            }
        }
        if (!modelInfo) {
            throw new Error('模型不存在')
        }
        return {
            ...modelInfo,
            name: modelInfo.id, // 使用id作为name字段
            model: modelInfo.id, // 使用id作为model字段
            status: StatusEnum.ENABLE
        }
    }

    async getAILmChat(params: any) {
        const {
            model,
            messages,
            is_stream,
            temperature = 0.7,
            top_k = 10,
            top_p = 0.8,
            max_tokens = 4096,
            tools = [],
            repetition_penalty = 1.0,
            frequency_penalty = 0.0,
            presence_penalty = 0.0,
            userId
        } = params

        try {
            // 定义新的消息列表
            const newMessageList = await convertMessagesToVLModelInput({
                messages,
                userId
            });
            const chatParams: ChatCompletionCreateParams = {
                model: model,
                messages: newMessageList || [],
                stream: is_stream,
                modalities: ["text", "audio"],
                audio: { "voice": "Chelsie", "format": "wav" },
                temperature: temperature,
                top_p: top_p,
                n: 1,
                max_tokens: max_tokens,
                frequency_penalty: frequency_penalty,
                presence_penalty: presence_penalty,
                user: userId,
            }
            if (tools?.length > 0) {
                chatParams.tool_choice="auto"; // 让模型自动选择调用哪个工具
                chatParams.stream_options = is_stream ? { include_usage: true } : undefined;
                chatParams.tools = tools; // 传递工具列表给模型
            }
            console.log(chatParams);
            const completion = await this.openai.chat.completions.create({
                ...chatParams,
                top_k: top_k,
                repetition_penalty: repetition_penalty,
            });
            return completion;
        } catch (e) {
            console.log(e)
            throw e;
        }
    }
    // 语音识别
    async getVoiceRecognize(params: any) {
        const {
            model,
            audio,
            language = VOICE_RECOGNIZE_LANGUAGE_MAP.zh.value,
            task = VOICE_RECOGNIZE_TASK_MAP.transcribe.value,
            userId
        } = params;
        try {
            let audioData = audio;
            if (typeof audio === "string" && (!audio.startsWith("http") || !audio.startsWith("https"))) {
                const objectName = getObjectName(audio, userId);
                const url: any = await createFileClient().presignedGetObject({
                    objectName
                })
                audioData = url;
            }
            let result: any = "";
            switch (task) {
                case VOICE_RECOGNIZE_TASK_MAP.translate.value:
                    result = await this.openai.audio.translations.create({
                        file: audioData,
                        model,
                        language,
                        task,
                    })
                    break;
                default:
                    result = await this.openai.audio.transcriptions.create({
                        file: audioData,
                        model,
                        language,
                        task
                    });
                    break;
            }
            if (!result) {
                throw new Error("语音识别失败");
            }
            let fullTranscription = result?.text || "";
            // 如果results是个数组
            if (Array.isArray(result)) {
                for (const transcription of result) {
                    fullTranscription += transcription?.text || "";
                }
            }
            return fullTranscription;
        } catch (e) {
            console.log(e)
            throw e;
        }
    }

    // 文本向量
    async getAILmEmbeddings(params: any) {
        const {
            model,
            input,
            encoding_format = 'float',
            dimensions = 1024,
            userId = null,
        } = params;
        try {
            const chatParams: EmbeddingCreateParams = {
                model,
                input,
                encoding_format,
                dimensions,
                user: userId,
            }
            return await this.openai.embeddings.create(chatParams)
        } catch (e) {
            console.log(e)
            throw e;
        }
    }

    // 图片生成
    async getAILmImageGenerate(params: any) {
        try {
            const {
                model,
                prompt,
                is_stream,
                quality = "standard",
                response_format = "url",
                style = "natural",
                size = "1024x1024",
                n = 1,
                userId = null
            } = params;
            const result = await this.openai.images.generate({
                model,
                prompt,
                quality,
                response_format,
                style,
                size,
                n
            }, {
                stream: is_stream
            });
            return result;
        }
        catch (e) {
            console.log(e)
            throw e;
        }
    }
}

export default OpenAIApi;
