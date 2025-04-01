import { ChatRequest, EmbedRequest, GenerateRequest, Ollama } from 'ollama';
import { StatusEnum } from '@/constants/DataMap';
import { MD5 } from 'crypto-js';
import { createFileClient, getObjectName } from '@/common/file';
import { convertImagesToVLModelInput, convertMessagesToVLModelInput } from './convert';

export const OLLAMA_CONFIG = {
    keep_alive: "5m",
}

class OllamaApi {
    private readonly ollama: Ollama;
    private readonly platformId: string = "";

    constructor(ops: any) {
        const { id, ...params } = ops;
        if (!id) throw new Error("缺少平台ID");

        if (id) {
            this.platformId = id;
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
                id: MD5(modelItem.name + this.platformId).toString(),
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
            id: MD5(model + this.platformId).toString(),
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
        const generate = await this.ollama.embed({ model, input: "Hello!", keep_alive });
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
            is_stream = true,
            keep_alive = OLLAMA_CONFIG?.keep_alive,
            temperature = 0.7,
            top_k = 10, 
            top_p = 0.9,
            num_predict = 4096,
            repeat_penalty = 1.0,
            frequency_penalty = 0.0,
            presence_penalty = 0.0,
            userId
        } = params;
        try {
            const newMessageList = await convertMessagesToVLModelInput({
                messages,
                userId
            });
            console.log(newMessageList);
            const chatParams: ChatRequest = {
                model,
                messages: newMessageList,
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
            }
            const chat = await this.ollama.chat({
                ...chatParams,
                stream: is_stream
            });
            return chat;
        } catch (error) {
            console.error('聊天失败:', error);
            throw error;
        }
    }

    async getAILmGenerate(params: any): Promise<any> {
        const {
            model,
            prompt,
            images,
            is_stream,
            keep_alive = OLLAMA_CONFIG?.keep_alive,
            temperature = 0.7,
            top_k = 10, 
            top_p = 0.9,
            num_predict = 4096,
            repeat_penalty = 1.0,
            frequency_penalty = 0.0,
            presence_penalty = 0.0,
            userId
        } = params;
        const newImages = await convertImagesToVLModelInput({
            images,
            userId
        });
        const chatParams: GenerateRequest = {
            model,
            images: newImages,
            prompt: prompt,
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
        }
        const chat = await this.ollama.generate({
            ...chatParams,
            stream: is_stream
        });
        return chat;
    }

    async getAILmEmbeddings(params: any): Promise<any> {
        const { model, input, truncate = true, keep_alive, userId } = params;
        const chatParams: EmbedRequest = {
            model, 
            input, 
            truncate, 
            keep_alive
        }
        const embeddings = await this.ollama.embed(chatParams);
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
}

export default OllamaApi;
