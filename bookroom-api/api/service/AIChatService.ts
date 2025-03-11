import AIChatModel from "@/models/AIChatModel";
import AIPlatformService from "./AIPlatformService";
import { v4 as uuidv4 } from 'uuid';
import { StatusEnum } from "@/constants/DataMap";

class AIChatService {

    // 查询AI对话列表
    static async queryAIChatList(params: any) {
        const { query } = params
        const list: any = await AIChatModel.findAll({
            where: {
                ...(query || {}),
            }
        })

        if (!list || list?.length < 1) {
            return []
        }
        return list
    }

    // 查询AI对话详情
    static async getAIChatById(chat_id: string) {
        if (!chat_id) {
            throw new Error("ID不能为空");
        }
        return await AIChatModel.findByPk(chat_id)
    }

    // 添加或者更新AI对话
    static async addOrUpdateAIChat(params: any) {
        const { chat_id, platform, model } = params
        if (!platform) {
            throw new Error("平台参数错误");
        }
        if (!model) {
            throw new Error("模型参数错误");
        }
        if (chat_id) {
            // 获取模型信息
            const aiChatInfo = await AIChatModel.findByPk(chat_id);
            if (aiChatInfo) {
                // 更新日志
                const result = await this.updateAIChat(params);
                return result;
            }
        }
        // 添加日志
        const result = await this.addAIChat(params);
        return result;
    }


    // 添加AI对话
    static async addAIChat(params: any) {
        const { chat_id, platform, model } = params
        if (!platform) {
            throw new Error("平台参数错误");
        }
        if (!model) {
            throw new Error("模型参数错误");
        }
        const result = await AIChatModel.create({
            id: chat_id || uuidv4(),
            platform: platform,
            model: model,
            type: params?.type || 1,
            paramters: params?.paramters || {},
            messages: params?.messages || [],
            userId: params?.userId || 0,
            status: params?.status || StatusEnum.DISABLE,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
        });
        return result
    }

    // 更新AI对话
    static async updateAIChat(params: any) {
        const { chat_id, platform, model } = params
        if (!platform) {
            throw new Error("平台参数错误");
        }
        if (!model) {
            throw new Error("模型参数错误");
        }
        const result = await AIChatModel.update(
            {
                platform: platform,
                model: model,
                type: params?.type || 1,
                paramters: params?.paramters || {},
                messages: params?.messages || [],
                userId: params?.userId || 0,
                status: params?.status || StatusEnum.DISABLE,
                updatedAt: new Date().getTime(),
            },
            {
                where: {
                    id: chat_id,
                }
            }
        );

        if (!result) {
            throw new Error("AI对话不存在或已删除");
        }
        return result
    }

    // 删除AI对话
    static async deleteAIChatById(chat_id: string) {
        if (!chat_id) {
            throw new Error("ID不能为空");
        }
        return await AIChatModel.destroy({
            where: {
                id: chat_id,
            },
        })
    }
}

export default AIChatService