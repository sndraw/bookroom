import { Context } from "koa";
import { resultError, resultSuccess } from "@/common/resultFormat";
import PlatformService from "@/service/PlatformService";
import BaseController from "./BaseController";
import { PLATFORM_RULE, URL_RULE } from "@/common/rule";
import { StatusEnum } from "@/constants/DataMap";

class PlatformController extends BaseController {
  /**
* 全部已启用配置列表-查询
* @param {Object} ctx 上下文对象，包含请求和响应信息
* @returns {Object} 返回响应体，包含成功或错误信息
*/
  static async queryActivedPlatformList(ctx: Context) {
    const params = ctx.request.query;
    try {
      const records = await PlatformService.queryActivedRecords(params);
      // 注册成功处理
      ctx.body = resultSuccess({
        data: records
      });
    } catch (e) {
      const error: any = e;
      // 异常处理，返回错误信息
      ctx.logger.error("已启用配置列表查询异常：", error); // 记录错误日志
      ctx.status = 500;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }

  // 查询配置列表
  static async queryPlatformList(ctx: Context) {
    const params = ctx.request.query;
    try {
      // 查询配置列表
      const result = await PlatformService.queryPlatformList(params, { safe: false });
      if (result && result?.list) {
        result?.list?.forEach((item: any) => {
          if (item.apiKey) {
            // 对apiKey加密，对前后三位之外的字符全部替换为*
            item.apiKey = item.apiKey.replace(
              /^(.{3})(.*)(.{3})$/,
              "$1****$3"
            );
          }
        });
      }
      ctx.status = 200;
      ctx.body = resultSuccess({
        data: result
      });
    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("查询配置列表异常", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }

  // 获取配置信息
  static async getPlatformInfo(ctx: Context) {
    const { platform } = ctx.params;
    try {
      if (!platform) {
        throw new Error("ID参数错误");
      }
      // 查询配置
      const result = await PlatformService.findPlatformByIdOrName(platform);
      ctx.status = 200;
      ctx.body = resultSuccess({
        data: result
      });
    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("查询配置信息异常", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }



  /**
   * 添加配置
   * @param {Object} ctx 上下文对象，包含请求和响应信息
   * @returns {Object} 返回响应体，包含成功或错误信息
   */
  static async addPlatform(ctx: Context) {

    const params: any = ctx.request.body;
    ctx.verifyParams({
      name: {
        type: "string",
        required: true,
        format: PLATFORM_RULE.name.RegExp,
        message: {
          required: "接口名称不能为空",
          format: PLATFORM_RULE.name.message,
        },
      },
      code: {
        type: "string",
        required: true,
        format: PLATFORM_RULE.code.RegExp,
        message: {
          required: "接口类型不能为空",
          format: PLATFORM_RULE.code.message,
        },
      },
      type: {
        type: "string",
        required: true,
        min: 2,
        max: 40,
        message: {
          required: "配置类型不能为空",
          min: "配置类型长度不能小于2",
          max: "配置类型长度不能超过40"
        },
      },
      host: {
        type: "string",
        required: true,
        length: 255,
        format: URL_RULE.ipAndUrl.RegExp,
        message: {
          required: "连接地址不能为空",
          type: "连接地址格式不正确",
          length: "连接地址长度不能超过255",
          format: URL_RULE.ipAndUrl.message,
        },
      },
      apiKey: {
        type: "string",
        required: false,
        length: 255,
        message: {
          required: "验证密钥不能为空",
          length: "验证密钥长度不能超过255",
        },
      },
      parameters: {
        type: "object",
        required: false,
        message: {
          required: "参数配置不能为空",
          object: "参数配置格式不正确",
        },
      },
      description: {
        type: "string",
        required: false,
        min: 1,
        max: 255,
        message: {
          required: "描述不能为空",
          min: "描述长度不能小于1",
          max: "描述长度不能超过255"
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
      ...params
    });
    try {
      await PlatformService.addPlatform(params)
      ctx.body = resultSuccess({
        data: "ok"
      });
    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("配置信息添加异常：", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }

  /**
   * 配置配置修改
   * @param {Object} ctx 上下文对象，包含请求和响应信息
   * @returns {Object} 返回响应体，包含成功或错误信息
   */
  static async changePlatformParameters(ctx: Context) {
    // 从路径获取配置ID
    const { platform } = ctx.params;
    const params: any = ctx.request.body;
    ctx.verifyParams({
      platform: {
        type: "string",
        required: true,
        min: 1,
        max: 40,
        message: {
          required: "ID不能为空",
          int: "ID不合法",
          min: "ID不合法",
          max: "ID不合法"
        },
      },
      parameters: {
        type: "object",
        required: false,
        message: {
          required: "参数配置不能为空",
          object: "参数配置格式不正确",
        },
      },
    }, {
      platform,
      ...params
    });
    try {
      const record: any = await PlatformService.findPlatformByIdOrName(platform);
      if (!record) {
        throw new Error("配置不存在");
      }
      record.parameters = params?.parameters;
      await record.save();
      // 成功处理
      ctx.body = resultSuccess({
        data: record
      });
    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("配置状态修改异常", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }


  /**
   * 配置状态修改
   * @param {Object} ctx 上下文对象，包含请求和响应信息
   * @returns {Object} 返回响应体，包含成功或错误信息
   */
  static async changePlatformStatus(ctx: Context) {
    // 从路径获取配置ID
    const { platform } = ctx.params;
    const params: any = ctx.request.body;
    ctx.verifyParams({
      platform: {
        type: "string",
        required: true,
        min: 1,
        max: 40,
        message: {
          required: "ID不能为空",
          int: "ID不合法",
          min: "ID不合法",
          max: "ID不合法"
        },
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
      platform,
      ...params
    });
    try {
      const record: any = await PlatformService.findPlatformByIdOrName(platform);
      if (!record) {
        throw new Error("配置不存在");
      }
      if (record?.status !== params?.status) {
        record.status = params?.status;
        await record.save();
      }

      // 成功处理
      ctx.body = resultSuccess({
        data: record
      });
    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("配置状态修改异常", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }

  /**
   * 接口名称、配置状态修改
   * @param {Object} ctx 上下文对象，包含请求和响应信息
   * @returns {Object} 返回响应体，包含成功或错误信息
   */
  static async changePlatformInfo(ctx: Context) {
    // 从路径获取配置ID
    const { platform } = ctx.params;
    const params: any = ctx.request.body;
    ctx.verifyParams({
      platform: {
        type: "string",
        required: true,
        min: 1,
        max: 40,
        message: {
          required: "ID不能为空",
          int: "ID不合法",
          min: "ID不合法",
          max: "ID不合法"
        },
      },
      name: {
        type: "string",
        required: false,
        format: PLATFORM_RULE.name.RegExp,
        message: {
          required: "接口名称不能为空",
          format: PLATFORM_RULE.name.message,
        },
      },
      code: {
        type: "string",
        required: false,
        format: PLATFORM_RULE.code.RegExp,
        message: {
          required: "接口类型不能为空",
          format: PLATFORM_RULE.code.message,
        },
      },
      type: {
        type: "string",
        required: false,
        min: 2,
        max: 40,
        message: {
          required: "配置类型不能为空",
          min: "配置类型长度不能小于2",
          max: "配置类型长度不能超过40"
        },
      },
      host: {
        type: "string",
        required: false,
        length: 255,
        format: URL_RULE.ipAndUrl.RegExp,
        message: {
          required: "连接地址不能为空",
          type: "连接地址格式不正确",
          length: "连接地址长度不能超过255",
          format: URL_RULE.ipAndUrl.message,
        },
      },
      apiKey: {
        type: "string",
        required: false,
        length: 255,
        message: {
          required: "验证密钥不能为空",
          length: "验证密钥长度不能超过255",
        },
      },
      description: {
        type: "string",
        required: false,
        min: 1,
        max: 255,
        message: {
          required: "描述不能为空",
          min: "描述长度不能小于1",
          max: "描述长度不能超过255"
        }
      },
      parameters: {
        type: "object",
        required: false,
        message: {
          required: "参数配置不能为空",
          type: "参数配置格式不正确",
        },
      },
    }, {
      platform,
      ...params
    });
    try {
      const { name, code, type, host, apiKey, parameters, description, status } = params;
      const record: any = await PlatformService.findPlatformByIdOrName(platform, { safe: false });
      if (!record) {
        throw new Error("配置不存在");
      }

      const data: any = {}
      if (name) {
        data.name = name;
      }
      if (code) {
        data.code = code;
      }
      if (type) {
        data.type = type;
      }
      if (host) {
        data.host = host;
      }
      // 防止加密误操作修改
      if (apiKey) {
        const originalApiKey = record?.apiKey?.replace(
          /^(.{3})(.*)(.{3})$/,
          "$1****$3"
        );
        if (originalApiKey !== apiKey) {
          data.apiKey = apiKey;
        }
      } else {
        data.apiKey = "";
      }
      if (description) {
        data.description = description;
      }
      if (parameters) {
        data.parameters = parameters;
      }
      if (status) {
        data.status = status;
      }
      await PlatformService.updatePlatform(record?.id, data)
      ctx.body = resultSuccess({
        data: "ok"
      });
    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("配置信息修改异常：", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }

  /**
   * 配置删除
   * @param {Object} ctx 上下文对象，包含请求和响应信息
   * @returns {Object} 返回响应体，包含成功或错误信息
   */
  static async deletePlatform(ctx: Context) {
    // 从路径获取配置ID
    const { platform } = ctx.params;
    ctx.verifyParams({
      platform: {
        type: "string",
        required: true,
        min: 1,
        max: 40,
        message: {
          required: "ID不能为空",
          int: "ID不合法",
          min: "ID不合法",
          max: "ID不合法"
        },
      }
    }, {
      platform
    });
    try {
      const record: any = await PlatformService.findPlatformByIdOrName(platform);
      if (!record) {
        throw new Error("配置不存在");
      }
      await PlatformService.deletePlatform(record?.id)
      ctx.body = resultSuccess({
        data: "ok"
      });
    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("配置删除异常：", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }

}

export default PlatformController;