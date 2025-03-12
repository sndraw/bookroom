/**
 * 登录与注册控制器
 * 继承自 BaseController，提供注册和登录功能
 */
import BaseController from "./BaseController";
import UserService from "@/service/UserService";
import { resultSuccess, resultError } from "@/common/resultFormat";
import { Context } from "koa";
import RoleService from "@/service/RoleService";
import LoginLogService from "@/service/LoginLogService";
import { USER_RULE } from "@/common/rule";
import { USER_ROLE_ENUM, USER_ROLE_NAME_OBJECT } from "@/constants/RoleMap";
import { refreshCurrentToken, setToken } from "@/middlewares/jwt.middleware";
import { StatusEnum } from "@/constants/DataMap";

class LoginController extends BaseController {
  /**
   * 用户注册
   * @param {Object} ctx 上下文对象，包含请求和响应信息
   * @returns {Object} 返回响应体，包含成功或错误信息
   */
  static async register(ctx: Context) {

    // 从请求中获取用户名和密码
    const params: any = ctx.request.body;
    ctx.verifyParams({
      username: {
        type: "string",
        required: true,
        format: USER_RULE.username.RegExp,
        message: {
          required: "用户名不能为空",
          format: USER_RULE.username.message,
        },
      },
      email: {
        type: "email",
        required: true,
        min: 1,
        max: 255,
        message: {
          required: "邮箱不能为空",
          format: USER_RULE.email.message,
        },
      },
      password: {
        type: "string",
        required: true,
        min: 1,
        max: 40,
        message: {
          required: "密码不能为空",
          min: "密码格式错误",
          max: "密码格式错误",
        },
      },
    }, params);
    try {
      const { username, email, password } = params;
      let user: any = await UserService.findRecordByUsername(username);

      if (user) {
        throw new Error("用户已存在");
      }
      let role: any = await RoleService.findRecordByCode(USER_ROLE_ENUM.USER);
      if (!role) {
        role = await RoleService.addRecord({
          name: USER_ROLE_NAME_OBJECT.USER,
          code: USER_ROLE_ENUM.USER
        });
        if (!role) {
          throw new Error("添加角色异常");
        }
      }

      if (!user) {
        const record = await UserService.addUserAndRole({
          username,
          email,
          password,
          roleId: role?.id,
          status: StatusEnum.DISABLE
        });

        // 注册失败处理
        if (!record) {
          throw new Error("用户注册异常");
        }


      }
      ctx.status = 200;
      // 注册成功处理
      ctx.body = resultSuccess({
        data: "ok"
      });
    } catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("用户注册异常：", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }

  }

  /**
   * 用户登录
   * @param {Object} ctx 上下文对象，包含请求和响应信息
   * @returns {Object} 返回响应体，包含成功或错误信息
   */
  static async login(ctx: Context) {

    const params: any = ctx.request.body;
    ctx.verifyParams({
      username: {
        type: "string",
        required: true,
        format: USER_RULE.username.RegExp,
        message: {
          required: "用户名不能为空",
          format: USER_RULE.username.message,
        },
      },
      password: {
        type: "string",
        required: true,
        min: 1,
        max: 40,
        message: {
          required: "密码不能为空",
          min: "密码格式错误",
          max: "密码格式错误",
        },
      },
    }, params);
    try {
      // 从请求中获取用户名
      const { username, password } = params;
      // 根据用户名查找用户信息
      const userInfo: any = await UserService.findRecordByUsername(username);
      // 用户不存在处理
      if (!userInfo) {
        throw new Error("用户不存在");
      }
      // 用户禁用处理
      if (userInfo?.status !== StatusEnum.ENABLE) {
        throw new Error("该用户暂未开通权限，请联系管理员");
      }

      // 验证用户是否尝试过多次登录
      const isAllowLogin = await LoginLogService.isAllowLogin(userInfo?.id);
      if (!isAllowLogin) {
        throw new Error("登录尝试次数过多，请稍后重试");
      }
      const userId = userInfo?.id;
      // 校验密码是否正确
      const checkPassword = await UserService.checkPassword(
        password,
        userInfo.salt,
        userInfo.password
      );
      if (!checkPassword) {
        await LoginLogService.recordLoginAttempt(userId, false);
        throw new Error("用户或密码错误");
      }
      // 生成并存储token
      const userTokenObj = await setToken(ctx, userId, {
        id: userId,
        username: userInfo?.username,
        email: userInfo?.email,
        role: userInfo?.role,
        roleId: userInfo?.roleId,
        roleName: userInfo?.roleName,
        status: userInfo?.status
      });
      // 记录登录日志
      await LoginLogService.recordLoginAttempt(userId, true);

      // 返回结果
      ctx.body = resultSuccess({
        data: {
          ...userTokenObj
        }
      });
    } catch (e) {
      const error: any = e;
      // 异常处理，返回错误信息
      ctx.logger.error("用户登录异常", error); // 记录错误日志
      ctx.status = 500;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }

  // 请求刷新token
  static async reqRefreshToken(ctx: Context) {
    try {
      const newTokenObj = await refreshCurrentToken(ctx);
      if (!newTokenObj) {
        throw new Error("刷新token失败");
      }
      ctx.body = resultSuccess({
        data: newTokenObj
      });
    } catch (e) {
      const error: any = e;
      // 异常处理，返回错误信息
      ctx.logger.error("刷新token异常", error); // 记录错误日志
      ctx.status = 500;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }


}

export default LoginController;