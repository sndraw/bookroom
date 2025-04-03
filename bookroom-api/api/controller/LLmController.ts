import { Context } from "koa";
import { resultError, resultSuccess } from "@/common/resultFormat";
import LlmService from "@/service/LlmService";
import BaseController from "./BaseController";
import PlatformService from "@/service/PlatformService";
import { StatusEnum } from "@/constants/DataMap";
import { PLATFORM_TYPE_MAP } from "@/common/platform";

class LlmController extends BaseController {

  // 获取AI模型列表
  static async queryLlmList(ctx: Context) {
    const { platform } = ctx.params;
    const { status, type } = ctx.query;
    try {
      // 查询AI模型列表
      const models = await LlmService.queryLlmList({
        platform,
        type,
        status
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
  static async getLlmInfo(ctx: Context) {
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
        min: 2,
        max: 40,
        message: {
          required: "接口名称不能为空",
          min: "接口名称长度不能小于2",
          max: "接口名称长度不能超过40",
        }
      },
      name: {
        type: "string",
        required: false,
        min: 2,
        max: 255,
        message: {
          required: "模型名称不能为空",
          min: "模型名称不能小于2",
          max: "模型名称不能超过255",
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
    }, {
      ...newParams
    })
    try {
      // 查询AI模型
      const result = await LlmService.getLlm({ model, platform });
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
   * 添加模型
   * @param {Object} ctx 上下文对象，包含请求和响应信息
   * @returns {Object} 返回响应体，包含成功或错误信息
   */
  static async addLlm(ctx: Context) {
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
        min: 2,
        max: 40,
        message: {
          required: "接口名称不能为空",
          min: "接口名称长度不能小于2",
          max: "接口名称长度不能超过40",
        }
      },
      name: {
        type: "string",
        required: false,
        min: 2,
        max: 255,
        message: {
          required: "模型名称不能为空",
          min: "模型名称不能小于2",
          max: "模型名称不能超过255",
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
    }, {
      ...newParams,
    })
    try {
      const result = await LlmService.addLlm({
        ...newParams
      });
      if (!result) {
        throw new Error("添加失败"); // 抛出异常，便于后续处理
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
   * 修改模型信息
   * @param {Object} ctx 上下文对象，包含请求和响应信息
   * @returns {Object} 返回响应体，包含成功或错误信息
   */
  static async changeLlmInfo(ctx: Context) {

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
      name: {
        type: "string",
        required: true,
        min: 2,
        max: 255,
        message: {
          required: "模型名称不能为空",
          min: "模型名称不能小于2",
          max: "模型名称不能超过255",
        }
      },
    }, {
      ...newParams
    })
    try {
      const record = await LlmService.updateLlm({
        platform,
        model,
        ...params
      });

      if (!record) {
        throw new Error("模型信息修改失败");
      }
      ctx.body = resultSuccess({
        data: "ok"
      });
    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("模型信息修改异常：", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code || error?.status_code,
        message: error?.message || error,
      });
    }
  }

  /**
 * 修改模型状态
 * @param {Object} ctx 上下文对象，包含请求和响应信息
 * @returns {Object} 返回响应体，包含成功或错误信息
 */
  static async changeLlmStatus(ctx: Context) {

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
      const record = await LlmService.updateLlmStatus(newParams);

      if (!record) {
        throw new Error("模型状态修改失败");
      }
      ctx.body = resultSuccess({
        data: "ok"
      });
    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("模型状态修改异常：", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code || error?.status_code,
        message: error?.message || error,
      });
    }
  }

  // 删除模型
  static async deleteLlm(ctx: Context) {
    // 从路径获取参数
    const { platform, model: model_param } = ctx.params;
    const model = decodeURIComponent(model_param);
    ctx.verifyParams({
      platform: {
        type: "string",
        required: true,
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
    }, {
      platform,
      model
    })
    try {
      if (!model) {
        throw new Error("ID参数错误");
      }
      const result = await LlmService.deleteLlm({ model, platform });
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
}

export default LlmController;