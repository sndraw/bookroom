import { Context } from "koa";
import BaseController from "./BaseController";


class McpController extends BaseController {
    static async queryMcpList(ctx: Context) {
        // 实现查询MCP列表的逻辑
    }
}

export default McpController;