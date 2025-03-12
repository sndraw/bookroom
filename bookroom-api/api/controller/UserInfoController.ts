/**
 * 登录与注册控制器
 * 继承自 BaseController，提供注册和登录功能
 */
import BaseController from "./BaseController";
import UserService from "@/service/UserService";
import { resultSuccess, resultError } from "@/common/resultFormat";
import { Context } from "koa";
import LoginLogService from "@/service/LoginLogService";
import { clearToken } from "@/middlewares/jwt.middleware";

class UserInfoController extends BaseController {

  // 获取初始化信息
  static async initial(ctx: Context) {
    const userInfo = ctx?.userInfo;
    if (!userInfo) {
      ctx.status = 401;
      ctx.body = resultError({
        message: "未登录"
      });
      return;
    }
    const result = resultSuccess({
      data: {
        username: userInfo?.username,
        email: userInfo?.email,
        role: userInfo?.role,
      }
    });
    ctx.body = result;
  }

  /**
   * 用户登出
   * @param {Object} ctx 上下文对象，包含请求和响应信息
   * @returns {Object} 返回响应体，包含成功或错误信息
   */
  static async logout(ctx: Context) {
    try {
      const userInfo = ctx?.userInfo;
      //删除token
      await clearToken(ctx, userInfo?.id);
      // 返回结果
      ctx.status = 200
      ctx.body = resultSuccess({
        data: "ok"
      });
    } catch (e) {
      const error: any = e;
      // 异常处理，返回错误信息
      ctx.logger.error("用户登出异常", error); // 记录错误日志
      ctx.status = 500;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }



  /**
 * 用户密码修改
 * @param {Object} ctx 上下文对象，包含请求和响应信息
 * @returns {Object} 返回响应体，包含成功或错误信息
 */
  static async pwd(ctx: Context) {

    const params: any = ctx.request.body;
    ctx.verifyParams({
      oldpassword: {
        type: "string",
        required: true,
        min: 2,
        max: 40,
        message: {
          required: "旧密码不能为空",
          min: "旧密码不合法",
          max: "旧密码不合法"
        },
      },
      password: {
        type: "string",
        required: true,
        min: 2,
        max: 40,
        message: {
          required: "新密码不能为空",
          min: "新密码不合法",
          max: "新密码不合法"
        },
      },
    }, params);
    try {
      const { oldpassword, password } = params;
      const { username } = ctx?.userInfo;
      // 根据用户名查找用户信息
      const userInfo: any = await UserService.findRecordByUsername(username);
      // 用户不存在处理
      if (!userInfo) {
        throw new Error("用户不存在");
      }
      const userId = userInfo?.id;
      // 校验原密码是否正确
      const checkPassword = await UserService.checkPassword(
        oldpassword,
        userInfo.salt,
        userInfo.password
      );
      if (!checkPassword) {
        await LoginLogService.recordLoginAttempt(userId, false);
        throw new Error("用户或密码错误");
      }

      // 修改用户信息
      const record = await UserService.updateRecord(userId, {
        password
      });
      if (!record) {
        throw new Error("用户密码修改异常");
      }

      //删除token
      await clearToken(ctx, userInfo?.id);

      // 返回结果
      ctx.body = resultSuccess({
        data: "ok"
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

}

export default UserInfoController;