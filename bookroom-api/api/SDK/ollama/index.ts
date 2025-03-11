import { Ollama } from 'ollama';
import { OLLAMA_CONFIG } from "@/common/ai";
import { StatusEnum } from '@/constants/DataMap';
import { MD5 } from 'crypto-js';
import { createFileClient } from '@/common/file';

class OllamaApi {
    private readonly ollama: Ollama;
    private readonly platfromId: string = "";

    constructor(ops: any) {
        const { id, ...params } = ops;
        if (!id) throw new Error("缺少平台ID");

        if (id) {
            this.platfromId = id;
        }

        this.ollama = new Ollama({
            ...params
        });
    }

    // 获取模型列表及其运行状态
    async queryAILmAndStatusList(query: any): Promise<any[]> {
        const list = await this.ollama.list();
        const runningList = await this.ollama.ps();
        const models = list.models.map((modelItem: any) => {
            const runningModel = runningList.models.find((item: any) => modelItem.name === item.name);
            const modelInfo = {
                ...modelItem,
                id: MD5(modelItem.name + this.platfromId).toString(),
                status: runningModel ? StatusEnum.ENABLE : StatusEnum.DISABLE
            };
            return modelInfo;
        });

        const newModels = models.filter((model: any) => {
            if (query?.status === StatusEnum.DISABLE) {
                return model?.status === StatusEnum.DISABLE;
            }
            if (query?.status === StatusEnum.ENABLE) {
                return model?.status === StatusEnum.ENABLE;
            }
            return true;
        });
        return newModels;
    }

    // 获取模型及其运行状态
    async getAILmAndStatusInfo(model: string): Promise<any> {
        const modelInfo = await this.ollama.show({ model: model });
        const runningList = await this.ollama.ps();
        const runningModel = runningList.models.find((item: any) => model === item.name);
        return {
            ...modelInfo,
            id: MD5(model + this.platfromId).toString(),
            name: model,
            model: model,
            status: runningModel ? StatusEnum.ENABLE : StatusEnum.DISABLE
        };
    }

    async getAILmList(): Promise<any> {
        const models = await this.ollama.list();
        return models;
    }

    async getAILmRunningList(): Promise<any> {
        const models = await this.ollama.ps();
        return models;
    }

    async getAILmInfo(params: any): Promise<any> {
        const { model } = params;
        const modelInfo = await this.ollama.show({ model });
        return modelInfo;
    }

    async showAILm(params: any): Promise<any> {
        const { model } = params;
        const generate = await this.ollama.show({ model });
        return generate;
    }

    async runAImodel(params: any): Promise<any> {
        const { model, keep_alive = OLLAMA_CONFIG?.keep_alive } = params;
        const generate = await this.ollama.embed({ model, input: "你好", keep_alive });
        return generate;
    }

    async stopAILm(params: any): Promise<any> {
        const { model, is_stream } = params;
        const generate = await this.ollama.generate({ model, prompt: "", stream: is_stream, keep_alive: 0 });
        return generate;
    }

    async getAILmChat(params: any): Promise<any> {
        const {
            model,
            messages,
            is_stream,
            keep_alive = OLLAMA_CONFIG?.keep_alive,
            temperature = 0.7,
            top_k = 10, top_p = 0.9,
            num_predict = 4096,
            repeat_penalty = 1.0,
            frequency_penalty = 0.0,
            presence_penalty = 0.0
        } = params;
        try {
            const newMessageList = await this.convertMessagesToVLModelInput({
                messages,
            });
            const chat = await this.ollama.chat({
                model,
                messages: newMessageList,
                stream: is_stream,
                keep_alive,
                options: {
                    num_predict,
                    temperature,
                    top_k,
                    top_p,
                    repeat_penalty,
                    frequency_penalty,
                    presence_penalty
                },
            });
            return chat;
        } catch (error) {
            console.error('聊天失败:', error);
            throw error;
        }
    }

    async getAILmGenerate(params: any): Promise<any> {
        const { model, prompt, images, is_stream, keep_alive = OLLAMA_CONFIG?.keep_alive } = params;
        const newImages = await this.convertImagesToVLModelInput({
            images,
        });
        const generate = await this.ollama.generate({
            model,
            images: newImages,
            stream: is_stream,
            prompt: prompt,
            keep_alive
        });
        return generate;
    }

    async getAILmEmbeddings(params: any): Promise<any> {
        const { model, input, truncate = false, keep_alive } = params;
        const embeddings = await this.ollama.embed({ model, input, truncate, keep_alive });
        return embeddings;
    }

    async pullAILm(params: any): Promise<any> {
        const { model, is_stream } = params;
        if (!model) {
            throw new Error('模型ID不能为空');
        }
        try {
            return await this.ollama.pull({ model, stream: is_stream, insecure: false });
        } catch (error) {
            console.error(model + '模型拉取失败:', error);
            throw error;
        }
    }

    async pushAILm(params: any): Promise<any> {
        const { model } = params;
        const push = await this.ollama.push({ model });
        return push;
    }

    async copyAILm(params: any): Promise<any> {
        const { source, destination } = params;
        const copy = await this.ollama.copy({ source, destination });
        return copy;
    }

    async deleteAILm(params: any): Promise<any> {
        const { model } = params;
        if (!model) {
            throw new Error('模型ID不能为空');
        }
        try {
            const del = await this.ollama.delete({ model });
            return del;
        } catch (error) {
            console.error('模型删除失败:', error);
            throw error;
        }
    }

    // 转换图片列表为模型输入格式
    async convertImagesToVLModelInput(params: {
        images: string;
    }): Promise<any> {
        const { images } = params;
        if (!images) {
            return null;
        };
        let newImages = [];
        if (images && Array.isArray(images)) {
            newImages = JSON.parse(JSON.stringify(images));
            for (let i = 0; i < newImages.length; i++) {
                const imageId = newImages[i];
                if (typeof imageId === "string") {
                    const imageData = await createFileClient().getObjectData({
                        objectName: imageId,
                        encodingType: "base64"
                    });
                    newImages[i] = imageData;
                }
            }
        }
        return newImages;
    }

    // 转换messages为模型输入格式
    async convertMessagesToVLModelInput(params: {
        messages: any[];
    }): Promise<any> {
        const { messages } = params;
        if (!messages || !Array.isArray(messages)) {
            return null;
        }
        const newMessages = JSON.parse(JSON.stringify(messages));
        for (const message of newMessages) {
            if (message.images && Array.isArray(message.images)) {
                for (let i = 0; i < message.images.length; i++) {
                    const imageId = message.images[i];
                    if (typeof imageId === "string") {
                        const imageData = await createFileClient().getObjectData(
                            {
                                objectName: imageId,
                                encodingType: "base64"
                            },
                        );
                        message.images[i] = imageData;
                    }
                }
            }
        }
        return newMessages;
    }
}

export default OllamaApi;
