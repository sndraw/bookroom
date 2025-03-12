import { Context } from "koa";
import { resultError, resultSuccess } from "@/common/resultFormat";
import BaseController from "./BaseController";
import AIChatService from "@/service/AIChatService";


class AIChatController extends BaseController {
  // 获取AI对话列表
  static async queryAIChatList(ctx: Context) {
    const params = ctx.query;
    try {
      // 查询AI对话列表
      const chatList = await AIChatService.queryAIChatList(params);
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
      const result = await AIChatService.getAIChatById(chat_id);
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
      chat_id
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
        required: true,
        min: 4,
        max: 40,
        message: {
          required: "平台名称不能为空",
          min: "平台名称长度不能小于4",
          max: "平台名称长度不能超过40",
        }
      },
      model: {
        type: "string",
        required: true,
        min: 4,
        max: 255,
        message: {
          required: "模型不能为空",
          min: "模型长度不能小于4",
          max: "模型长度不能超过255",
        }
      },
      paramters: {
        type: "object",
        required: true,
        message: {
          required: "模型参数不能为空",
          object: "模型参数格式非法",
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
      const result = await AIChatService.addOrUpdateAIChat(newParams);
      if(!result) {
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