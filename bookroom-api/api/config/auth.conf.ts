import RouteAuthMap from "@/routers/RouteAuthMap";
import RouteMap from "@/routers/RouteMap";

// token存储key
export const USER_TOKEN_KEY = process.env?.USER_TOKEN_KEY || 'work_token';

// 登录错误最大尝试次数
export const LOGIN_MAX_ERROR_COUNT = Number(process.env?.LOGIN_MAX_ERROR_COUNT || 3);
// 登录错误锁定时间(分钟)
export const LOGIN_LOCK_TIME = Number(process.env?.LOGIN_LOCK_TIME || 5);



// 路由白名单，从RouteAuthMap中筛选
export const NO_AUTH_PATH_LIST = Object.keys(RouteAuthMap)
    .filter((key) => {
        return !RouteAuthMap[key as keyof typeof RouteAuthMap]
    })
    .map((key) => RouteMap[key as keyof typeof RouteMap]);

// 全局路由鉴权列表
export const AUTH_PATH_LIST = Object.keys(RouteAuthMap)
    .filter((key) => {
        return RouteAuthMap[key as keyof typeof RouteAuthMap]
    })
    .map((key) => {
        return {
            url: RouteMap[key as keyof typeof RouteMap],
            auth: RouteAuthMap[key as keyof typeof RouteAuthMap]
        }
    })