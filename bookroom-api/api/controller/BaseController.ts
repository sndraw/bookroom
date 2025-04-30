import { USER_ROLE_ENUM } from "@/constants/RoleMap";
import { Context } from "koa";

class BaseController {
    // 权限校验
    static authorize(ctx: Context, record: { id: any; role: USER_ROLE_ENUM; }, data: any = {}) {
        const userInfo = ctx?.userInfo;
        const userId = ctx?.userId;
        // 如果用户是当前用户
        if (record?.id === userId) {
            throw new Error("不能修改当前用户");
        }
        // 如果用户同样是管理员，不允许修改
        if (record?.role === USER_ROLE_ENUM.ADMIN) {
            throw new Error("无权修改管理员用户");
        }
        // 如果当前用户和所改用户是同一角色，不允许修改
        if (record?.role === userInfo.role) {
            throw new Error("不能修改同角色用户");
        }
        // 如果要修改的角色是管理员或者运维人员
        if (data?.role && [USER_ROLE_ENUM.ADMIN, USER_ROLE_ENUM.OPS].includes(data?.role)) {
            // 如果当前角色不是管理员，不允许修改
            if (userInfo.role !== USER_ROLE_ENUM.ADMIN) {
                throw new Error("无权修改管理员或运维用户");
            }
        }
        return true;
    }
}
export default BaseController;
