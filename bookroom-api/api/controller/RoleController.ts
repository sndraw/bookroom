/**
 * 登录与注册控制器
 * 继承自 BaseController，提供注册和登录功能
 */
import BaseController from "./BaseController";
import RoleService from "@/service/RoleService";
// import RoleTokenService from "./@/service/RoleTokenService";
import { resultSuccess, resultError } from "@/common/resultFormat";
import { Context } from "koa";
import { ROLE_RULE } from "@/common/rule";
import { USER_ROLE_ENUM } from "@/constants/RoleMap";
import { StatusEnum } from "@/constants/DataMap";

class RoleController extends BaseController {

  /**
 * 已启用角色列表-查询
 * @param {Object} ctx 上下文对象，包含请求和响应信息
 * @returns {Object} 返回响应体，包含成功或错误信息
 */
  static async queryActivedRoleList(ctx: Context) {
    try {
      const records = await RoleService.queryActivedRecords();
      // 注册成功处理
      ctx.body = resultSuccess({
        data: {
          list: records
        }
      });
    } catch (e) {
      const error: any = e;
      // 异常处理，返回错误信息
      ctx.logger.error("已启用角色列表查询异常：", error); // 记录错误日志
      ctx.status = 500;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }


  /**
   * 角色列表-查询
   * @param {Object} ctx 上下文对象，包含请求和响应信息
   * @returns {Object} 返回响应体，包含成功或错误信息
   */
  static async queryRoleList(ctx: Context) {
    const params = ctx.request.query;
    try {
      const records = await RoleService.queryRecords(params);
      // 注册成功处理
      ctx.body = resultSuccess({
        data: records
      });
    } catch (e) {
      const error: any = e;
      // 异常处理，返回错误信息
      ctx.logger.error("角色列表查询异常：", error); // 记录错误日志
      ctx.status = 500;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }

  /**
   * 角色详情-查询
   * @param {Object} ctx 上下文对象，包含请求和响应信息
   * @returns {Object} 返回响应体，包含成功或错误信息
   */
  static async getRoleDetail(ctx: Context) {

    const params = ctx.params;
    ctx.verifyParams({
      id: {
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
    }, params);
    try {
      const record = await RoleService.findRecordById(params?.id);

      // 成功处理
      ctx.body = resultSuccess({
        data: record
      });
    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("角色详情查询异常：", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }
  /**
   * 添加角色
   * @param {Object} ctx 上下文对象，包含请求和响应信息
   * @returns {Object} 返回响应体，包含成功或错误信息
   */
  static async addRole(ctx: Context) {

    const params: any = ctx.request.body;
    ctx.verifyParams({
      name: {
        type: "string",
        required: true,
        format: ROLE_RULE.name.RegExp,
        message: {
          required: "角色名称不能为空",
          format: ROLE_RULE.name.message,
        },
      },
      code: {
        type: "string",
        required: true,
        format: ROLE_RULE.code.RegExp,
        message: {
          required: "角色标识不能为空",
          format: ROLE_RULE.code.message,
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
      ...params
    });
    try {

      const { name, code, status } = params;

      const record1: any = await RoleService.findRecordByName(name);
      if (record1) {
        throw new Error("角色名称已存在");
      }

      const record2: any = await RoleService.findRecordByCode(code);
      if (record2) {
        throw new Error("角色标识已存在");
      }


      // 如果添加角色是管理员
      if (code === USER_ROLE_ENUM.ADMIN) {
        throw new Error("管理员角色不允许添加");
      }

      const data: any = {}
      if (name) {
        data.name = name;
      }
      if (code) {
        data.code = code;
      }

      if (status) {
        data.status = status;
      }
      await RoleService.addRecord(data)
      ctx.body = resultSuccess({
        data: "ok"
      });
    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("角色信息添加异常：", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }



  /**
   * 角色状态修改
   * @param {Object} ctx 上下文对象，包含请求和响应信息
   * @returns {Object} 返回响应体，包含成功或错误信息
   */
  static async changeRoleStatus(ctx: Context) {
    try {
      // 从路径获取角色ID
      const id: any = ctx.params.id;
      const params: any = ctx.request.body;

      ctx.verifyParams({
        id: {
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
        id,
        ...params
      });
      const ids = id.split(',');
      if (ids?.length > 1) {
        throw new Error("功能暂未实现");
      }
      const record: any = await RoleService.findRecordById(id);
      if (!record) {
        throw new Error("角色不存在");
      }

      // 如果角色是管理员
      if (record?.code === USER_ROLE_ENUM.ADMIN) {
        throw new Error("管理员角色不允许修改");
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
      ctx.logger.error("角色状态修改异常", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }

  /**
   * 角色名称、角色标识、角色状态修改
   * @param {Object} ctx 上下文对象，包含请求和响应信息
   * @returns {Object} 返回响应体，包含成功或错误信息
   */
  static async changeRoleInfo(ctx: Context) {

    // 从路径获取角色ID
    const id: any = ctx.params.id;
    const params: any = ctx.request.body;
    ctx.verifyParams({
      id: {
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
        min: 2,
        max: 30,
        message: {
          required: "角色名称不能为空",
          min: "角色名称长度不能小于2",
          max: "角色名称长度不能超过30",
        },
      },
      code: {
        type: "string",
        required: false,
        min: 2,
        max: 30,
        message: {
          required: "角色标识不能为空",
          min: "角色标识长度不能小于2",
          max: "角色标识不能不能超过30",
        },
      },
    }, {
      id,
      ...params
    });
    try {
      const { name, code, status } = params;
      const record: any = await RoleService.findRecordById(id);
      if (!record) {
        throw new Error("角色不存在");
      }

      // 如果添加的角色是管理员
      if (code === USER_ROLE_ENUM.ADMIN) {
        throw new Error("管理员角色不允许添加");
      }
      // 如果角色是管理员
      if (record?.code === USER_ROLE_ENUM.ADMIN) {
        throw new Error("管理员角色不允许修改");
      }

      const data: any = {}
      if (name) {
        data.name = name;
      }
      if (code) {
        data.code = code;
      }

      if (status) {
        data.status = status;
      }
      await RoleService.updateRecord(id, data)
      ctx.body = resultSuccess({
        data: "ok"
      });
    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("角色信息修改异常：", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }

  /**
   * 角色删除
   * @param {Object} ctx 上下文对象，包含请求和响应信息
   * @returns {Object} 返回响应体，包含成功或错误信息
   */
  static async deleteRole(ctx: Context) {

    // 从路径获取角色ID
    const id: any = ctx.params.id;
    ctx.verifyParams({
      id: {
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
      id
    });
    try {
      const record: any = await RoleService.findRecordById(id);
      if (!record) {
        throw new Error("角色不存在");
      }

      // 如果角色是管理员
      if (record?.code === USER_ROLE_ENUM.ADMIN) {
        throw new Error("管理员角色不允许删除");
      }
      await RoleService.deleteRecord(id)
      ctx.body = resultSuccess({
        data: "ok"
      });
    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("角色删除异常：", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }
}

export default RoleController;