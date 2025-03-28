import OpenAI from 'openai'
import { StatusEnum } from '@/constants/DataMap';
import { createFileClient, getObjectName } from '@/common/file';
import { VOICE_RECOGNIZE_LANGUAGE_MAP, VOICE_RECOGNIZE_TASK_MAP } from '@/common/voice';

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
            if (typeof modelItem.created === 'number'){
                if (modelItem.created < 10000000000) {
                    modelInfo.createdAt = modelItem.created * 1000;
                }else{
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
            top_p = 0.8,
            max_tokens = 4096,
            userId
        } = params

        try {
            // 定义新的消息列表
            const newMessageList = await this.convertMessagesToVLModelInput({
                messages,
                userId
            });
            const completion = await this.openai.chat.completions.create({
                model,
                messages: newMessageList || [],
                stream: is_stream,
                stream_options: is_stream ? { include_usage: true } : undefined,
                temperature: temperature,
                top_p: top_p,
                n: 1,
                max_tokens: max_tokens,
                modalities: ["text"],
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


    // 对话补全
    async getAILmGenerate(params: any) {
        const {
            model,
            prompt,
            images,
            is_stream,
            top_p = 0.8,
            temperature = 0.7,
            max_tokens = 4096,
            userId
        } = params;

        try {
            let newMessageList: any[] = [
                {
                    role: "system",
                    content: [{ type: "text", text: "You are a helpful assistant." }],
                }
            ];
            if (images && images.length > 0 || images && images.length > 0) {
                const userMessage = await this.convertImagesToVLModelInput({
                    text: prompt,
                    images,
                    userId
                });
                if (userMessage) {
                    newMessageList.push(userMessage)
                }
            }

            const completion = await this.openai.chat.completions.create({
                model,
                messages: newMessageList || [],
                stream: is_stream,
                stream_options: is_stream ? { include_usage: true } : undefined,
                temperature: temperature,
                top_p: top_p,
                n: 1,
                max_tokens: max_tokens
            });
            return completion
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
            userId = null
        } = params;
        try {
            return await this.openai.embeddings.create({
                model,
                input
            })
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

    // 转换图片列表为模型输入格式
    async convertImagesToVLModelInput(params: {
        text: string;
        images: string;
        userId?: string;
    }) {
        const { text, images, userId } = params;
        if (!images) {
            return null;
        };
        const userMessage: any = {
            role: "user",
            content: [],
        };

        if (images && Array.isArray(images)) {
            for (const item of images) {
                const message = {
                    type: "image_url",
                    image_url: {
                        url: item,
                    }
                }
                if (typeof item === "string" && (!item.startsWith("http") || !item.startsWith("https"))) {
                    try {

                        const objectName = getObjectName(item, userId);
                        const imageObj: any = await createFileClient().getObjectData({
                            objectName,
                            encodingType: "base64",
                            addFileType: true,
                        })
                        if (!imageObj?.dataStr) continue;
                        message.image_url.url = imageObj?.dataStr;
                    }
                    catch (error) {
                        console.error('获取图片失败:', error);
                        continue;
                    }
                }
                userMessage.content.push(message);
            }
        }
        userMessage.content.push(
            { type: "text", text: text }
        )
        return userMessage;
    }

    // 转换messages为模型输入格式
    async convertMessagesToVLModelInput(params: {
        messages: any[];
        userId?: string;
    }) {
        const { messages, userId } = params;
        if (!messages || !Array.isArray(messages)) {
            return null;
        }

        const newMessageList: any[] = [];
        // 循环messages
        for (const message of messages) {
            const newMessage: any = {
                role: message.role,
                content: []
            };
            // 如果是system
            if (message.role === "system") {
                const content = message.content;
                if (typeof content === "string") {
                    newMessage.content.push({
                        type: "text",
                        text: content
                    });
                }
            }
            if (message.role === "user" || message.role === "assistant") {
                const content = message?.content;
                const images = message?.images;
                if (images && Array.isArray(images)) {
                    for (const item of images) {
                        const message = {
                            type: "image_url",
                            image_url: {
                                url: item,
                            }
                        }
                        if (typeof item === "string" && (!item.startsWith("http") || !item.startsWith("https"))) {
                            try {
                                const objectName = getObjectName(item, userId);
                                const imageObj: any = await createFileClient().getObjectData({
                                    objectName,
                                    encodingType: "base64",
                                    addFileType: true,
                                })
                                if (!imageObj?.dataStr) continue;
                                message.image_url.url = imageObj?.dataStr;
                            }
                            catch (error) {
                                console.error('获取图片失败:', error);
                                continue;
                            }
                        }
                        newMessage.content.push(message);
                    }
                }
                const audios = message?.audios;
                if (audios && Array.isArray(audios)) {
                    for (const item of audios) {
                        const message = {
                            type: "input_audio",
                            input_audio: {
                                data: item,
                                format: "mp3" //默认格式为mp3，实际格式可能需要根据实际情况进行调整
                            }
                        }
                        if (typeof item === "string" && (!item.startsWith("http") || !item.startsWith("https"))) {
                            try {
                                const objectName = getObjectName(item, userId);
                                const audioObj: any = await createFileClient().getObjectData({
                                    objectName,
                                    encodingType: "base64",
                                    addFileType: true,
                                })
                                if (!audioObj?.dataStr) continue;
                                message.input_audio = {
                                    data: audioObj?.dataStr,
                                    format: audioObj?.fileType || "mp3",
                                }
                            } catch (error) {
                                console.error('获取音频失败:', error);
                                continue;
                            }
                        }
                        newMessage.content.push(message);
                    }
                }
                if (typeof content === "string") {
                    newMessage.content.push({
                        type: "text",
                        text: content || "Hello!"
                    });
                }
            }

            newMessageList.push(newMessage);
        }
        return newMessageList;

    }
}

export default OpenAIApi;
