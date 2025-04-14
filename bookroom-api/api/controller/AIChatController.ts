import { Context } from "koa";
import { resultError, resultSuccess } from "@/common/resultFormat";
import BaseController from "./BaseController";
import AIChatService from "@/service/AIChatService";
import PlatformService from "@/service/PlatformService";


class AIChatController extends BaseController {
  // 获取AI对话列表
  static async queryAIChatList(ctx: Context) {
    const { query_mode = "list", ...query } = ctx.query || {}
    try {
      if (query_mode === "search") {
        const { platform, model, chat_type } = query || {};
        if (!platform || !model) {
          throw new Error("参数错误");
        }
        // 获取平台
        const platformConfig: any = await PlatformService.findPlatformByIdOrName(platform as string, {
          safe: false
        });
        if (!platformConfig) {
          throw new Error("平台不存在");
        }
        // 查询AI对话
        const result = await AIChatService.findAIChatByParams({
          platformId: platformConfig.id,
          model,
          chat_type,
          userId: ctx.userId,
        });
        ctx.status = 200;
        ctx.body = resultSuccess({
          data: {
            record: result
          }
        });
        return;
      }

      // 查询AI对话列表
      const chatList = await AIChatService.queryAIChatList({
        query: {
          ...query,
          userId: ctx.userId,
        }
      });
      ctx.status = 200;
      ctx.body = resultSuccess({
        data: {
          list: chatList
        }
      });

    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("查询AI对话列表异常", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }


  // 获取AI对话信息
  static async getAIChatInfo(ctx: Context) {
    // 从路径获取参数
    const { chat_id } = ctx.params;

    try {
      if (!chat_id) {
        throw new Error("缺少对话ID参数");
      }
      // 查询AI对话
      const result = await AIChatService.getAIChatById(chat_id, {
        userId: ctx.userId,
      });
      ctx.status = 200;
      ctx.body = resultSuccess({
        data: result
      });
    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("查询AI对话信息异常", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }

  // 保存对话
  static async saveAIChat(ctx: Context) {
    // 从路径获取参数
    const { chat_id } = ctx.params;
    const params: any = ctx.request.body;
    const newParams = {
      ...params,
      chat_id,
      userId: ctx.userId
    }
    ctx.verifyParams({
      chat_id: {
        type: "string",
        required: false,
        length: 64,
        message: {
          // required: "对话ID不能为空",
          length: "对话ID长度不能超过64"
        }
      },
      platform: {
        type: "string",
        required: false,
        min: 2,
        max: 40,
        message: {
          required: "接口名称不能为空",
          min: "接口名称长度不能小于2",
          max: "接口名称长度不能超过40",
        }
      },
      model: {
        type: "string",
        required: true,
        min: 2,
        max: 255,
        message: {
          required: "模型不能为空",
          min: "模型长度不能小于2",
          max: "模型长度不能超过255",
        }
      },
      chat_type: {
        type: "string",
        required: true,
        min: 1,
        max: 50,
        message: {
          required: "类型不能为空",
          min: "模型长度不能小于1",
          max: "模型长度不能超过50",
        }
      },
      parameters: {
        type: "object",
        required: false,
        message: {
          required: "模型参数不能为空",
          object: "模型参数格式非法",
        },
      },
      prompt: {
        type: "string",
        required: false,
        max: 1024,
        message: {
          required: "提示长度不能为空",
          max: "提示长度不能超过1024",
        },
      },
      messages: {
        type: "array",
        required: false,
        message: {
          array: "对话列表格式非法"
        },
      },
    }, {
      ...newParams
    })
    try {
      const { platform, model, chat_type, ...data } = newParams;
      // 获取平台
      const platformConfig: any = await PlatformService.findPlatformByIdOrName(platform as string, {
        safe: false
      });
      if (!platformConfig) {
        throw new Error("平台不存在");
      }
      // 查询是否存在
      const chat = await AIChatService.findAIChatByParams({
        platformId: platformConfig.id,
        model,
        chat_type,
        userId: ctx.userId,
      });
      let name = data?.name || "未知对话";
      // 如果对话消息第一条为字符串，截取前10个字符作为对话名称
      if (typeof data?.messages?.[0]?.content === "string") {
        name = data?.messages?.[0]?.content?.slice(0, 10);
      }
      // 如果对话消息第一条为数组
      if (Array.isArray(data?.messages?.[0]?.content) && data?.messages?.[0]?.content[0]?.text) {
        name = data?.messages?.[0]?.content[0]?.text?.slice(0, 10);
      }
      if (chat) {
        if (chat.getDataValue('userId') !== ctx.userId) {
          throw new Error("无权限修改该对话");
        }

        chat.setAttributes({
          ...data,
          name: name,
          platformId: platformConfig.id,
          model,
          userId: ctx.userId,
          updatedAt: new Date().getTime(),
        });
        await chat.save();
        ctx.status = 200;
        ctx.body = resultSuccess({
          data: chat
        });
        return;
      }

      const result = await AIChatService.addAIChat({
        ...data,
        name,
        chat_type,
        platformId: platformConfig.id,
        model,
        userId: ctx.userId
      });
      if (!result) {
        throw new Error("保存AI对话失败");
      }
      ctx.status = 200;
      ctx.body = resultSuccess({
        data: result
      });
    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("保存AI对话异常", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }


  // 删除对话
  static async deleteAIChat(ctx: Context) {
    const { chat_id } = ctx.params;
    try {
      if (!chat_id) {
        throw new Error("请传入对话ID");
      }
      // 查询是否存在
      const chat = await AIChatService.getAIChatById(chat_id, {
        userId: ctx.userId,
      });
      if (!chat) {
        throw new Error("对话不存在");
      }
      if (chat.getDataValue('userId') !== ctx.userId) {
        throw new Error("无权限删除该对话");
      }
      const result = await AIChatService.deleteAIChatById(chat_id);
      if (!result) {
        throw new Error("删除AI对话失败");
      }

      ctx.status = 200;
      ctx.body = resultSuccess({
        data: result
      });
    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("删除AI对话异常", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }

}

export default AIChatController;