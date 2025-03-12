import { Context } from "koa";
import { resultError } from "@/common/resultFormat";
import { NO_AUTH_PATH_LIST, USER_TOKEN_KEY } from "../config/auth.conf";

const jwt = require("jsonwebtoken");
const secret = process.env?.OAUTH2_SECRET || "jwt-demo";
const bearer = process.env?.OAUTH2_BEARER || "Bearer";
const expiresIn = Number(process.env?.OAUTH2_EXPIRES_IN || "3600");
const refreshTokenExpiresIn = Number(process.env?.OAUTH2_EXPIRES_IN || "3600") * 3;
// JWT中间件
export default () => {
    console.log("JWT中间件", "路由白名单", NO_AUTH_PATH_LIST);
    const middleware = async (ctx: Context, next: () => Promise<any>) => {
        // 如果当前路径在路由白名单中，无需鉴权
        const matched = NO_AUTH_PATH_LIST.some(item => {
            return ctx.path === item.path && ctx.method.toUpperCase() === item.method.toUpperCase();
        });
        if (matched) {
            return next();
        }
        const clientToken = String(ctx.header?.authorization || ""); // 获取jwt
        if (clientToken) {
            try {
                // 解密，获取payload
                const decodedObj = await verifyToken(clientToken);
                if (decodedObj) {
                    const userId = decodedObj?.payload?.userId;
                    // 如果token已经过期
                    if (decodedObj?.payload?.exp * 1000 < new Date().getTime()) {
                        ctx.status = 401;
                        ctx.body = resultError({
                            message: "授权已过期",
                        });
                        return;
                    }

                    const userTokenObj = await getToken(ctx, userId);
                    if (!userTokenObj?.access_token) {
                        ctx.status = 401;
                        ctx.body = resultError({
                            message: "授权失效",
                        });
                        return;
                    }
                    if (decodedObj?.token !== userTokenObj?.access_token) {
                        ctx.status = 401;
                        ctx.body = resultError({
                            message: "异地登录",
                        });
                        return;
                    }
                    // 获取用户信息
                    const userInfo = userTokenObj?.data?.userInfo;
                    ctx.userId = userId;
                    ctx.role = userInfo?.role;
                    ctx.userInfo = userInfo;
                }
            } catch (e) {
                ctx.status = 401;
                ctx.body = resultError({
                    message: "鉴权失败",
                });
                return;
            }
        } else {
            ctx.status = 401;
            ctx.body = resultError({
                message: "未授权",
            });
            return;
        }
        return next();
    };
    return middleware;
};

export const getToken = async (ctx: Context, userId: any) => {
    const tokenObj = await ctx.redis.getAllItems(`${USER_TOKEN_KEY}:${userId}`);
    if (tokenObj?.data_token) {
        tokenObj["data"] = await jwt.verify(tokenObj?.data_token, secret);
    }
    return tokenObj;
};
export const setToken = async (ctx: Context, userId: any, data: any = {}) => {
    if (!userId) {
        return;
    }
    const userTokenObj = await signToken(userId);
    const data_token = await jwt.sign({ userId, userInfo: data }, secret, { expiresIn: refreshTokenExpiresIn });
    await ctx.redis.setMulItems(
        `${USER_TOKEN_KEY}:${userId}`,
        {
            userId: userId,
            data_token: data_token,
            access_token: userTokenObj?.access_token,
            refresh_token: userTokenObj?.refresh_token,
            expires_in: userTokenObj?.expires_in
        },
        refreshTokenExpiresIn
    );
    return {
        access_token: userTokenObj?.access_token,
        refresh_token: userTokenObj?.refresh_token,
        expires_in: userTokenObj?.expires_in
    };
};

export const clearToken = async (ctx: Context, userId: any) => {
    await ctx.redis.delAllItems(`${USER_TOKEN_KEY}:${userId}`);
};
// 解密
export const verifyToken = async (token: string) => {
    const tokenStr = token.replace(`${bearer} `, "");
    const payload = jwt.verify(tokenStr, secret);
    return {
        token: tokenStr,
        payload
    };
};

// 加密
export const signToken = async (userId: any) => {
    // 获取token
    const access_token = jwt.sign({ userId: userId, type: "access_token" }, secret, { expiresIn: expiresIn });
    // 生成刷新 token ，并设置过期时间，过期时间是access_token 的3倍
    const refresh_token = jwt.sign({ userId: userId, type: "refresh_token" }, secret, { expiresIn: refreshTokenExpiresIn });
    console.log(new Date().getTime(), expiresIn * 1000);
    return {
        access_token,
        refresh_token,
        expires_in: new Date().getTime() + expiresIn * 1000
    };
};

// 刷新token
export const refreshCurrentToken = async (ctx: Context) => {
    const originalToken = (ctx.header?.authorization || "").replace(`${bearer} `, "")
    if (!originalToken) {
        throw new Error("token为空");
    }
    let payload = null;
    try {
        payload = jwt.verify(originalToken, secret);
    } catch (error) {
        throw new Error("鉴权失败");
    }
    const userId = payload?.userId;
    if (!userId) {
        throw new Error("token非法");
    }
    const userTokenObj = await getToken(ctx, userId);
    if (!userTokenObj?.access_token) {
        throw new Error("token已失效");
    }
    if (originalToken !== userTokenObj?.refresh_token) {
        throw new Error("token不一致");
    }
    const userInfo = userTokenObj?.data?.userInfo;
    // 生成新的token
    const newUserTokenObj = await setToken(ctx, userId, userInfo);
    if (!newUserTokenObj) {
        throw new Error("刷新token失败");
    }
    return {
        ...newUserTokenObj
    };
};