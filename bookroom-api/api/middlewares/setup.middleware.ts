import { Context } from "koa";
import { resultNotSetup } from "@/common/resultFormat";
import SiteService from "@/service/SiteService";
import RouteMap from "@/routers/RouteMap";

// 判定是否初始化中间件
export default () => {
    return async (ctx: Context, next: () => Promise<any>) => {
        const record = await SiteService.findRecordBySetup();
        if (record) {
            await next();
        } else if (ctx.path === RouteMap?.SETUP) {
            await next();
        } else {
            ctx.status = 403;
            ctx.body = resultNotSetup();
        }
    };
};