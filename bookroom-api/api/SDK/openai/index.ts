import OpenAI from 'openai'
import { StatusEnum } from '@/constants/DataMap';
import { createFileClient } from '@/common/file';

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
            baseURL: host
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
        const { model, messages, is_stream, temperature = 0.7, top_p = 0.8, max_tokens = 4096 } = params
        // 定义新的消息列表
        const newMessageList = await this.convertMessagesToVLModelInput({
            messages
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
        });
        return completion
    }

    async getAILmGenerate(params: any) {
        const { model, prompt, images, is_stream, temperature = 0.7, max_tokens = 4096 } = params;
        let newMessageList: any[] = [
            {
                role: "system",
                content: [{ type: "text", text: "You are a helpful assistant." }],
            }
        ];
        if (images && images.length > 0) {
            const userMessage = await this.convertImagesToVLModelInput({
                text: prompt,
                images,
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
            top_p: 0.8,
            n: 1,
            max_tokens: max_tokens
        });
        return completion
    }
    // 文本向量
    async getAILmEmbeddings(params: any) {
        const {
            model,
            input
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
        const {
            model,
            prompt,
            is_stream,
            quality = "standard",
            response_format = "url",
            style = "natural",
            size = "1024x1024",
            n = 1
        } = params;
        const result= await this.openai.images.generate({
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

    // 转换图片列表为模型输入格式
    async convertImagesToVLModelInput(params: {
        text: string;
        images: string;
    }) {
        const { text, images } = params;
        if (!images) {
            return null;
        };
        const userMessage: any = {
            role: "user",
            content: [{ type: "text", text: text }],
        };

        let image_url: any = "";
        if (images && Array.isArray(images)) {
            image_url = images[0]
            if (typeof image_url === "string" && (!image_url.startsWith("http") || !image_url.startsWith("https"))) {
                image_url = await createFileClient().getObjectData({
                    objectName: image_url,
                    encodingType: "base64",
                    addFileType: true,
                })
            }
            if (image_url) {
                userMessage.content.push({
                    type: "image_url",
                    image_url: image_url,
                })
            }
        };
        return userMessage;
    }

    // 转换messages为模型输入格式
    async convertMessagesToVLModelInput(params: {
        messages: any[];
    }) {
        const { messages } = params;
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
                if (typeof content === "string") {
                    newMessage.content.push({
                        type: "text",
                        text: content
                    });
                }
                const images = message?.images;
                if (images && Array.isArray(images)) {
                    let image_url = images[0]
                    if (typeof image_url === "string" && (!image_url.startsWith("http") || !image_url.startsWith("https"))) {
                        image_url = await createFileClient().getObjectData({
                            objectName: image_url,
                            encodingType: "base64",
                            addFileType: true,
                        })
                    }
                    newMessage.content.push({
                        type: "image_url",
                        image_url: {
                            url: image_url,
                        },
                    });
                }
            }
            newMessageList.push(newMessage);
        }

        return newMessageList;

    }
}

export default OpenAIApi;
