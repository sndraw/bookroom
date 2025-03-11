import { Context } from "koa";
import { resultError, resultSuccess } from "../common/resultFormat";
import AILmThirdService from "../service/AILmThirdService";
import BaseController from "./BaseController";
import AIPlatformService from "../service/AIPlatformService";
import AIChatLogService from "../service/AIChatLogService";

import { responseStream } from "../utils/streamHelper";
import { AI_PLATFORM_TYPE_MAP } from "@/common/ai";
import { StatusEnum } from "@/constants/DataMap";

class AILmController extends BaseController {

  // 获取-全部来源-AI模型-列表
  static async queryAllAILmList(ctx: Context) {
    const { platform, ...query } = ctx.query;
    try {
      let platformList: any = []
      let models: any = [];
      if (!platform) {
        const platformInfoList = await AIPlatformService.queryActivedRecords({
          type: AI_PLATFORM_TYPE_MAP.model.value
        });
        platformList = platformInfoList.map((item: any) => {
          return item.name
        })
      } else {
        platformList.push(platform)
      }
      for (const platformItem of platformList) {
        const platformModels: any = await AILmThirdService.queryAILmList({
          platform: platformItem,
          query
        });
        models = models.concat(platformModels);
      }
      ctx.status = 200;
      ctx.body = resultSuccess({
        data: {
          list: models
        }
      });
    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("查询AI模型列表异常", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }

  // 获取AI模型列表
  static async queryAILmList(ctx: Context) {
    const { platform } = ctx.params;
    const query = ctx.query;
    try {
      // 查询AI模型列表
      const models = await AILmThirdService.queryAILmList({
        platform,
        query
      });
      ctx.status = 200;
      ctx.body = resultSuccess({
        data: {
          list: models
        }
      });
    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("查询AI模型列表异常", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }

  // 获取AI模型信息
  static async getAILmInfo(ctx: Context) {
    // 从路径获取参数
    const { platform, model: model_param } = ctx.params;
    const model = decodeURIComponent(model_param);
    const params: any = ctx.request.body;
    const newParams = {
      ...params,
      platform,
      model
    }
    ctx.verifyParams({
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
    }, {
      ...newParams
    })
    try {
      // 查询AI模型
      const result = await AILmThirdService.getAILm({ model, platform });
      ctx.status = 200;
      ctx.body = resultSuccess({
        data: result
      });
    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("查询AI模型信息异常", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }

  /**
   * 下载模型
   * @param {Object} ctx 上下文对象，包含请求和响应信息
   * @returns {Object} 返回响应体，包含成功或错误信息
   */
  static async pullAILm(ctx: Context) {

    // 从路径获取参数
    const { platform } = ctx.params;

    let params: any = ctx.request.body;
    if (typeof params === 'string') {
      // 将字符串转换为对象
      params = JSON.parse(params);
    }
    const model = decodeURIComponent(params?.model || '');
    const newParams = {
      ...params,
      platform,
      model
    }
    ctx.verifyParams({
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
    }, {
      ...newParams,
    })
    try {
      const { is_stream } = newParams;
      const dataStream = await AILmThirdService.pullAILm({
        ...newParams
      });
      if (is_stream) {
        await responseStream(ctx, dataStream);
        return;
      }
      ctx.status = 200;
      ctx.body = resultSuccess({
        data: "ok"
      });

    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("模型添加异常：", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code || error?.status_code,
        message: error?.message || error,
      });
    }
  }

  /**
 * 运行/停止模型
 * @param {Object} ctx 上下文对象，包含请求和响应信息
 * @returns {Object} 返回响应体，包含成功或错误信息
 */
  static async runAILm(ctx: Context) {
    // 从路径获取参数
    const { platform, model: model_param } = ctx.params;
    const model = decodeURIComponent(model_param);
    const params: any = ctx.request.body;
    const newParams = {
      ...params,
      platform,
      model
    }
    ctx.verifyParams({
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
      status: {
        type: "enum",
        required: true,
        convertType: "int",
        values: [StatusEnum.ENABLE, StatusEnum.DISABLE],
        message: {
          required: "状态不能为空",
          type: "状态不合法"
        },
      },
    }, {
      ...newParams
    })

    try {
      const record = await AILmThirdService.runAILm(newParams);

      if (!record) {
        throw new Error("模型运行/停止失败");
      }
      ctx.body = resultSuccess({
        data: "ok"
      });
    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("模型运行/停止异常：", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code || error?.status_code,
        message: error?.message || error,
      });
    }
  }
  // 删除模型
  static async deleteAILm(ctx: Context) {
    // 从路径获取参数
    const { platform, model: model_param } = ctx.params;
    const model = decodeURIComponent(model_param);
    ctx.verifyParams({
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
    }, {
      platform,
      model
    })
    try {
      if (!model) {
        throw new Error("ID参数错误");
      }
      const result = await AILmThirdService.deleteAILm({ model, platform });
      if (!result) {
        throw new Error("删除模型失败");
      }
      ctx.status = 200;
      ctx.body = resultSuccess({
        data: result
      });
    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("删除模型异常", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }
  /**
   * 对话模型
   * @param {Object} ctx 上下文对象，包含请求和响应信息
   * @returns {Object} 返回响应体，包含成功或错误信息
   */
  static async chatAILm(ctx: Context) {
    const { platform, model: model_param } = ctx.params;
    let params: any = ctx.request.body;
    if (typeof params === 'string') {
      // 将字符串转换为对象
      params = JSON.parse(params);
    }
    const model = decodeURIComponent(model_param || '');
    const newParams = {
      platform,
      model,
      ...params,
    }
    ctx.verifyParams({
      chat_id: {
        type: "string",
        required: false,
        min: 32,
        max: 64,
        message: {
          required: "对话ID不能为空",
          min: "对话ID长度不能小于32",
          max: "对话ID长度不能超过64",
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
      messages: {
        type: "array",
        required: true,
        message: {
          required: "对话列表不能为空",
          array: "对话列表格式非法"
        },
      },
      temperature: {
        type: "number",
        required: false,
        min: 0,
        max: 1,
        message: {
          min: "温度不能小于0",
          max: "温度不能超过1",
        },
      },
      top_p: {
        type: "number",
        required: false,
        min: 0,
        max: 1,
        message: {
          min: "Top P不能小于0",
          max: "Top P不能超过1",
        },
      },
      top_k: {
        type: "number",
        required: false,
        min: 1,
        max: 100,
        message: {
          min: "Top K不能小于1",
          max: "Top K不能超过100",
        },
      },
      max_tokens: {
        type: "number",
        required: false,
        min: 1,
        max: 8192,
        message: {
          min: "最大输出长度不能小于1",
          max: "最大输出长度不能超过8192",
        },
      },
      repeat_penalty: {
        type: "number",
        required: false,
        min: -2.0,
        max: 2.0,
        message: {
          min: "惩罚强度不能小于-2.0",
          max: "惩罚强度不能超过2.0",
        },
      },
      frequency_penalty: {
        type: "number",
        required: false,
        min: -2.0,
        max: 2.0,
        message: {
          min: "频率惩罚不能小于-2.0",
          max: "频率惩罚不能超过2.0",
        },
      },
      presence_penalty: {
        type: "number",
        required: false,
        min: -2.0,
        max: 2.0,
        message: {
          min: "存在惩罚不能小于-2.0",
          max: "存在惩罚不能超过2.0",
        },
      }
    }, {
      ...newParams
    })
    // 回复文本
    let responseText: any = '';
    try {
      const { is_stream } = newParams;
      const dataStream = await AILmThirdService.chatAILm({
        ...newParams
      });
      if (is_stream) {
        responseText = await responseStream(ctx, dataStream);
        return;
      }
      responseText = dataStream?.choices?.[0]?.message?.content || dataStream?.message?.content || '';
      ctx.status = 200;
      ctx.body = resultSuccess({
        data: responseText
      });

    } catch (e: any) {
      // 异常处理，返回错误信息
      ctx.logger.error("模型对话异常：", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e?.error || e;
      ctx.body = resultError({
        code: error?.code || error?.status_code,
        message: error?.message || error,
      });

      responseText = error?.message || '';
    } finally {
      ctx.res.once('close', () => {
        // 添加聊天记录到数据库
        AIChatLogService.addAIChatLog({
          chat_id: newParams?.chat_id,
          platform,
          model,
          type: 1,
          input: JSON.stringify(params), // 将请求参数转换为JSON字符串
          output: responseText || '', // 确保响应文本不为空字符串
          userId: ctx?.userId, // 假设ctx中包含用户ID
        });
      })
    }

  }

  /**
 * 对话补全
 * @param {Object} ctx 上下文对象，包含请求和响应信息
 * @returns {Object} 返回响应体，包含成功或错误信息
 */
  static async generateAILm(ctx: Context) {
    const { platform, model: model_param } = ctx.params;
    let params: any = ctx.request.body;
    if (typeof params === 'string') {
      // 将字符串转换为对象
      params = JSON.parse(params);
    }
    const model = decodeURIComponent(model_param || '');
    const newParams = {
      platform,
      model,
      ...params,
    }
    ctx.verifyParams({
      chat_id: {
        type: "string",
        required: false,
        min: 32,
        max: 64,
        message: {
          required: "对话ID不能为空",
          min: "对话ID长度不能小于32",
          max: "对话ID长度不能超过64",
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
      prompt: {
        type: "string",
        required: true,
        min: 1,
        max: 1024,
        message: {
          required: "提示词不能为空",
          min: "提示词长度不能小于4",
          max: "提示词长度不能超过1024",
        }
      },
      images: {
        type: "array",
        required: false,
        message: {
          type: "数组类型错误，请输入字符串数组",
        },
      }
    }, {
      ...newParams
    })

    // 回复文本
    let responseText: any = '';
    try {
      const { is_stream } = newParams;
      const dataStream = await AILmThirdService.generateAILm({
        ...newParams
      });
      if (is_stream) {
        responseText = await responseStream(ctx, dataStream);
        return;
      }
      responseText = dataStream?.response || '';
      ctx.status = 200;
      ctx.body = resultSuccess({
        data: responseText
      });

    } catch (e: any) {
      // 异常处理，返回错误信息
      ctx.logger.error("对话补全异常：", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e?.error || e;
      ctx.body = resultError({
        code: error?.code || error?.status_code,
        message: error?.message || error,
      });

      responseText = error?.message || '';
    } finally {
      ctx.res.once('close', () => {
        // 添加聊天记录到数据库
        AIChatLogService.addAIChatLog({
          chat_id: newParams?.chat_id,
          platform,
          model,
          type: 1,
          input: JSON.stringify(params), // 将请求参数转换为JSON字符串
          output: responseText || '', // 确保响应文本不为空字符串
          userId: ctx?.userId, // 假设ctx中包含用户ID
        });
      })
    }
  }


  /**
* 生成嵌入向量
* @param {Object} ctx 上下文对象，包含请求和响应信息
* @returns {Object} 返回响应体，包含成功或错误信息
*/
  static async embeddingVector(ctx: Context) {
    const { platform, model: model_param } = ctx.params;
    let params: any = ctx.request.body;
    if (typeof params === 'string') {
      // 将字符串转换为对象
      params = JSON.parse(params);
    }
    const model = decodeURIComponent(model_param || '');
    const newParams = {
      platform,
      model,
      ...params,
    }
    ctx.verifyParams({
      chat_id: {
        type: "string",
        required: false,
        min: 32,
        max: 64,
        message: {
          required: "对话ID不能为空",
          min: "对话ID长度不能小于32",
          max: "对话ID长度不能超过64",
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
      input: {
        type: "array",
        required: true,
        message: {
          required: "文本列表不能为空",
          array: "文本列表格式非法"
        },
      },
    }, {
      ...newParams
    })

    // 回复文本
    let responseText: any = '';
    try {
      const { is_stream } = newParams;
      const dataStream = await AILmThirdService.embeddingVector({
        ...newParams
      });
      if (is_stream) {
        responseText = await responseStream(ctx, dataStream);
        return;
      }
      responseText = dataStream || '';
      ctx.status = 200;
      ctx.body = resultSuccess({
        data: responseText
      });

    } catch (e: any) {
      // 异常处理，返回错误信息
      ctx.logger.error("生成嵌入向量异常：", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e?.error || e;
      ctx.body = resultError({
        code: error?.code || error?.status_code,
        message: error?.message || error,
      });

      responseText = error?.message || '';
    } finally {
      ctx.res.once('close', () => {
        // 添加聊天记录到数据库
        AIChatLogService.addAIChatLog({
          chat_id: newParams?.chat_id,
          platform,
          model,
          type: 1,
          input: JSON.stringify(params), // 将请求参数转换为JSON字符串
          output: responseText || '', // 确保响应文本不为空字符串
          userId: ctx?.userId, // 假设ctx中包含用户ID
          status: StatusEnum.ENABLE
        });
      })
    }
  }

  // 生成图片
  static async generateImage(ctx: Context) {
    const { platform, model: model_param } = ctx.params;
    let params: any = ctx.request.body;
    if (typeof params === 'string') {
      // 将字符串转换为对象
      params = JSON.parse(params);
    }
    const model = decodeURIComponent(model_param || '');
    const newParams = {
      platform,
      model,
      ...params,
    }
    ctx.verifyParams({
      chat_id: {
        type: "string",
        required: false,
        min: 32,
        max: 64,
        message: {
          required: "对话ID不能为空",
          min: "对话ID长度不能小于32",
          max: "对话ID长度不能超过64",
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
      prompt: {
        type: "string",
        required: true,
        min: 1,
        max: 1024,
        message: {
          required: "提示词不能为空",
          min: "提示词长度不能小于4",
          max: "提示词长度不能超过1024",
        }
      },
    }, {
      ...newParams
    })
    // 回复文本
    let responseText: any = '';
    try {
      const { is_stream } = newParams;
      const dataStream = await AILmThirdService.generateImage({
        ...newParams
      });
      if (is_stream) {
        responseText = await responseStream(ctx, dataStream);
        return;
      }
      responseText = dataStream?.response || dataStream || '';
      ctx.status = 200;
      ctx.body = resultSuccess({
        data: responseText
      });

    } catch (e: any) {
      // 异常处理，返回错误信息
      ctx.logger.error("生成嵌入向量异常：", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e?.error || e;
      ctx.body = resultError({
        code: error?.code || error?.status_code,
        message: error?.message || error,
      });

      responseText = error?.message || '';
    } finally {
      ctx.res.once('close', () => {
        // 添加聊天记录到数据库
        AIChatLogService.addAIChatLog({
          chat_id: newParams?.chat_id,
          platform,
          model,
          type: 1,
          input: JSON.stringify(params), // 将请求参数转换为JSON字符串
          output: responseText || '', // 确保响应文本不为空字符串
          userId: ctx?.userId, // 假设ctx中包含用户ID
        });
      })
    }

  }

}

export default AILmController;