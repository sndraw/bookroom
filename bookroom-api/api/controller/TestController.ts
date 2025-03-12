import BaseController from "./BaseController";
import { resultSuccess } from "@/common/resultFormat";
import { Context } from "koa";
import { getRoleMap } from "@/constants/RoleMap";

/**
 * 测试-接口
 **/
class TestController extends BaseController {
  static async index(ctx: Context) {
    const data = getRoleMap();
    const result = resultSuccess({
      data: data
    });
    ctx.body = result;
  }

  // 获取用户信息
  static async userinfo(ctx: Context) {
    const userInfo = ctx?.id;
    const result = resultSuccess({
      data: {
        username: userInfo?.username,
        email: userInfo?.email,
        role: userInfo?.role,
      }
    });
    ctx.body = result;
  }
}

export default TestController;
