import AIChatModel from "@/models/AIChatModel";
import PlatformService from "./PlatformService";
import { v4 as uuidv4 } from 'uuid';
import { StatusEnum } from "@/constants/DataMap";
import { getOrderArray } from "@/utils/query";

class AIChatService {

    // 查询AI对话列表
    static async queryAIChatList(params: any) {
        const { query, sorter } = params
        const list: any = await AIChatModel.findAll({
            where: {
                ...(query || {}),
            },
            order: getOrderArray(sorter),
        })

        if (!list || list?.length < 1) {
            return []
        }
        return list
    }
    // 查询单条AI对话详情-通过查询参数
    static async findAIChatByParams(where: any = {}) {
        return await AIChatModel.findOne({
            where: {
                ...where,
            },
        });
    }

    // 查询AI对话详情
    static async getAIChatById(chat_id: string, where: any = {}) {
        if (!chat_id) {
            throw new Error("ID不能为空");
        }
        return await AIChatModel.findOne({
            where: {
                id: chat_id,
                ...where,
            },
        });
    }

    // 添加或者更新AI对话
    static async addOrUpdateAIChat(params: any) {
        const { chat_id, platformId, model, type } = params
        if (!platformId) {
            throw new Error("平台参数错误");
        }
        if (!model) {
            throw new Error("模型参数错误");
        }
        if (!type) {
            throw new Error("类型参数错误");
        }
        if (chat_id) {
            // 获取对话信息
            const chatInfo = await AIChatModel.findByPk(chat_id);
            if (chatInfo) {
                const { chat_id, platform, ...data } = params;
                // 更新对话
                chatInfo.setAttributes({
                    ...data,
                    name: data?.name || data?.messages?.[0]?.content?.slice(0, 10) || "未知对话",
                    updatedAt: new Date().getTime(),
                });
                const result = await chatInfo.save();
                return result;
            }
        }
        // 添加对话
        const result = await this.addAIChat(params);
        return result;
    }


    // 添加AI对话
    static async addAIChat(params: any) {
        const { chat_id, platformId, model, chat_type } = params
        if (!platformId) {
            throw new Error("平台参数错误");
        }
        if (!model) {
            throw new Error("模型参数错误");
        }
        if (!chat_type) {
            throw new Error("对话类型参数错误");
        }
        const data = {
            id: chat_id || uuidv4(),
            name: params?.name || params?.messages?.[0]?.content?.slice(0, 10) || "未知对话",
            platformId,
            model: model,
            chat_type: chat_type,
            prompt: params?.prompt || "",
            parameters: params?.parameters || {},
            messages: params?.messages || [],
            userId: params?.userId || 0,
            status: params?.status || StatusEnum.ENABLE,
            createdAt: new Date().getTime(),
            updatedAt: new Date().getTime(),
        };

        const result = await AIChatModel.create(data);

        return result
    }

    // 更新AI对话
    static async updateAIChat(params: any) {
        const { chat_id, platformId, model, chat_type } = params
        if (!platformId) {
            throw new Error("平台参数错误");
        }
        if (!model) {
            throw new Error("模型参数错误");
        }
        if (!chat_type) {
            throw new Error("对话类型参数错误");
        }
        const data = {
            platformId,
            name: params?.name || params?.messages?.[0]?.content?.slice(0, 10) || "未知对话",
            model: model,
            chat_type: chat_type,
            prompt: params?.prompt || "",
            parameters: params?.parameters || {},
            messages: params?.messages || [],
            userId: params?.userId || 0,
            status: params?.status || StatusEnum.ENABLE,
            updatedAt: new Date().getTime(),
        }
        const result = await AIChatModel.update(
            {
                ...data
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