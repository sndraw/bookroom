/**
 * 登录与注册控制器
 * 继承自 BaseController，提供注册和登录功能
 */
import BaseController from "./BaseController";
import UserService from "../service/UserService";
// import UserTokenService from "./../service/UserTokenService";
import { resultSuccess, resultError } from "../common/resultFormat";
import { Context } from "koa";
import { USER_RULE } from "../common/rule";
import RoleService from "../service/RoleService";
import { USER_ROLE_ENUM } from "@/constants/RoleMap";
import { StatusEnum } from "@/constants/DataMap";
import { clearToken } from "@/middlewares/jwt.middleware";

class UserController extends BaseController {
  /**
   * 用户列表-查询
   * @param {Object} ctx 上下文对象，包含请求和响应信息
   * @returns {Object} 返回响应体，包含成功或错误信息
   */
  static async queryUserList(ctx: Context) {
    const params = ctx.request.query;
    ctx.verifyParams({
      username: {
        type: "string",
        required: false,
        min: 1,
        max: 64,
        message: {
          required: "用户名不能为空",
          min: "用户名长度不能小于1",
          max: "用户名长度不能超过64",
        },
      },
      email: {
        type: "string",
        required: false,
        min: 1,
        max: 255,
        message: {
          required: "邮箱不能为空",
          min: "邮箱长度不能小于1",
          max: "邮箱长度不能超过255",
        },
      },
      role: {
        type: "string",
        required: false,
        min: 1,
        max: 40,
        message: {
          required: "角色不能为空",
          min: "角色长度不能小于1",
          max: "角色长度不能超过40",
        },
      },
      status: {
        type: "enum",
        required: false,
        convertType: "int",
        values: [StatusEnum.ENABLE, StatusEnum.DISABLE],
        message: {
          required: "状态不能为空",
          type: "状态不合法"
        },
      },
      startDate: {
        type: "dateTime",
        required: false,
        message: "开始时间不合法",
      },
      endDate: {
        type: "dateTime",
        required: false,
        message: "结束时间不合法",
      },
    }, params);
    try {
      const records = await UserService.queryRecords(params);
      // 注册成功处理
      ctx.body = resultSuccess({
        data: records
      });
    } catch (e) {
      const error: any = e;
      // 异常处理，返回错误信息
      ctx.logger.error("用户列表查询异常：", error); // 记录错误日志
      ctx.status = 500;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }

  /**
   * 用户详情-查询
   * @param {Object} ctx 上下文对象，包含请求和响应信息
   * @returns {Object} 返回响应体，包含成功或错误信息
   */
  static async getUserDetail(ctx: Context) {

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
      const record = await UserService.findRecordById(params?.id);

      // 成功处理
      ctx.body = resultSuccess({
        data: record
      });
    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("用户详情查询异常：", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }

  /**
   * 用户状态修改
   * @param {Object} ctx 上下文对象，包含请求和响应信息
   * @returns {Object} 返回响应体，包含成功或错误信息
   */
  static async changeUserStatus(ctx: Context) {

    // 从路径获取用户ID
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
    try {
      const ids = id.split(',');
      if (ids?.length > 1) {
        throw new Error("功能暂未实现");
      }
      const record: any = await UserService.findRecordById(id);
      if (!record) {
        throw new Error("用户不存在");
      }
      // 如果用户是管理员
      if (record?.role === USER_ROLE_ENUM.ADMIN) {
        throw new Error("管理员不允许修改");
      }

      if (record?.status !== params?.status) {
        record.status = params?.status;
        await record.save();
      }
      // 如果用户被禁用，清除token状态
      if (params?.status === StatusEnum.DISABLE) {
        // 清除token状态
        await clearToken(ctx, id);
      }
      // 成功处理
      ctx.body = resultSuccess({
        data: record
      });
    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("用户状态修改异常", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }

  /**
   * 用户名称、角色、邮箱、状态修改
   * @param {Object} ctx 上下文对象，包含请求和响应信息
   * @returns {Object} 返回响应体，包含成功或错误信息
   */
  static async changeUserInfo(ctx: Context) {

    // 从路径获取用户ID
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
      username: {
        type: "string",
        required: false,
        format: USER_RULE.username.RegExp,
        message: {
          required: "用户名不能为空",
          format: USER_RULE.username.message,
        },
      },
      email: {
        type: "email",
        required: false,
        min: 1,
        max: 255,
        message: {
          required: "邮箱不能为空",
          email: "邮箱格式不合法",
          min: "邮箱长度不能小于1",
          max: "邮箱长度不能超过255",
        },
      },
      roleId: {
        type: "string",
        required: false,
        min: 1,
        max: 40,
        message: {
          required: "角色ID不能为空",
          min: "角色ID长度不能小于1",
          max: "角色ID长度不能超过40",
        },
      },
      status: {
        type: "enum",
        required: false,
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

    try {
      const { roleId, email, status } = params;

      const record: any = await UserService.findRecordById(id);
      if (!record) {
        throw new Error("用户不存在");
      }

      const roleInfo: any = await RoleService.findRecordById(roleId);
      // 如果添加的角色是管理员
      if (roleInfo?.code === USER_ROLE_ENUM.ADMIN) {
        throw new Error("管理员角色不允许修改");
      }
      // 如果用户是管理员
      if (record?.role === USER_ROLE_ENUM.ADMIN) {
        throw new Error("管理员不允许修改");
      }

      const data: any = {}
      if (roleId) {
        data.roleId = roleId;
      }
      if (email) {
        data.email = email;
      }
      if (status) {
        data.status = status;
      }
      await UserService.updateUserAndRole(id, data)

      //删除token
      await clearToken(ctx, id);

      ctx.body = resultSuccess({
        data: "ok"
      });
    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("用户信息修改异常：", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }


  /**
     * 用户删除
     * @param {Object} ctx 上下文对象，包含请求和响应信息
     * @returns {Object} 返回响应体，包含成功或错误信息
     */
  static async deleteUser(ctx: Context) {

    // 从路径获取用户ID
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
      const record: any = await UserService.findRecordById(id);
      if (!record) {
        throw new Error("用户不存在");
      }

      // 如果用户是管理员
      if (record?.role === USER_ROLE_ENUM.ADMIN) {
        throw new Error("管理员角色不允许删除");
      }

      await UserService.deleteUserAndRole(id)
      ctx.body = resultSuccess({
        data: "ok"
      });
    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("用户删除异常：", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }

}

export default UserController;