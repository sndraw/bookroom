import { Context } from "koa";
import { resultDenied } from "@/common/resultFormat";
import { USER_ROLE_ENUM } from "@/constants/RoleMap";
import { AUTH_PATH_LIST, NO_AUTH_PATH_LIST } from "../config/auth.conf";

// 鉴权中间件
export default (current_route_path: string) => {
    const middleware = async (ctx: Context, next: () => Promise<any>) => {
        // 如果当前路径在路由白名单中，无需鉴权
        const matched = NO_AUTH_PATH_LIST.find(item => {
            return current_route_path === item.path && ctx.method.toUpperCase() === item.method.toUpperCase();
        });
        if (matched) {
            return next();
        }
        // 获取匹配的路由-对象
        const matchedPathObj = Object.values(AUTH_PATH_LIST).find((item) => {
            return current_route_path === item.path && ctx.method.toUpperCase() === item.method.toUpperCase();
        })
        // 获取匹配的路由-鉴权角色列表
        const authRoleList: USER_ROLE_ENUM[] = matchedPathObj?.auth || [];
        // 当前用户-详情信息
        const userInfo = ctx?.userInfo;
        // 当前用户-角色列表
        const currentUserRoles = userInfo?.role?.split(",");
        // 如果当前路径授权角色列表不为空，则根据用户角色判断访问权限
        if (Array.isArray(authRoleList) && authRoleList.length > 0) {
            // 如果当前角色为管理员，则允许访问
            if (userInfo && currentUserRoles?.includes(USER_ROLE_ENUM.ADMIN)) {
                return next();
            }
            // 如果当前角色非管理员，则继续判断
            if (userInfo && !currentUserRoles?.includes(USER_ROLE_ENUM.ADMIN)) {
                // 如果当前路径授权的角色列表，与当前用户角色列表无交集，则无权访问
                const roleMatched = authRoleList.some((role: USER_ROLE_ENUM) => currentUserRoles.includes(role));
                if (!roleMatched) {
                    ctx.status = 403;
                    ctx.body = resultDenied();
                    return;
                }
                return next();
            }
        }
        return next();

    };
    return middleware;
};