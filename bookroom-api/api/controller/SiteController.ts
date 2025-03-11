import BaseController from "./BaseController";
import { resultError, resultSuccess } from "../common/resultFormat";
import SiteService from "../service/SiteService";
import UserService from "../service/UserService";
import RoleService from "../service/RoleService";

import { Context } from "koa";
import { getRoleMap, USER_ROLE_ENUM, USER_ROLE_NAME_OBJECT } from "@/constants/RoleMap";
import { StatusEnum } from "@/constants/DataMap";
import { USER_RULE } from "@/common/rule";
/**
 * 网站-全局接口
 **/
class SiteController extends BaseController {

  // 获取初始化信息
  static async setup(ctx: Context) {
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
      const record = await SiteService.findRecordBySetup();
      // 添加默认角色
      const roleMap = getRoleMap();
      for (let key in roleMap) {
        const roleInfo = await RoleService.addRecord({
          name: roleMap[key]?.name,
          code: roleMap[key]?.value,
        });
        if (!roleInfo) {
          throw new Error("添加角色异常");
        }
      }
      if (!record) {
        const userData = {
          username: username,
          password: password,
          email: email
        };
        const user: any = await UserService.findRecordByUsername(userData.username);
        const role: any = await RoleService.findRecordByCode(USER_ROLE_ENUM.ADMIN);
        if (!user) {
          const userRoles = await UserService.addUserAndRole({
            ...userData,
            roleId: role?.id
          });
          if (!userRoles) {
            throw new Error("用户关联角色异常");
          }
        }

        const setupData = {
          setup: StatusEnum.ENABLE
        };
        await SiteService.addRecord(setupData);
        ctx.body = resultSuccess({
          data: {
            setup: true
          }
        });
        return;
      }
      ctx.status = 200;
      ctx.body = resultError({
        message: "网站已初始化"
      });
    } catch (e) {
      const error: any = e;
      // 异常处理，返回错误信息
      ctx.logger.error("网站初始化异常", error); // 记录错误日志
      ctx.status = 500;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }
}

export default SiteController;
