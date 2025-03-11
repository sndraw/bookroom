import BaseController from "./BaseController";
import { resultError, resultSuccess } from "../common/resultFormat";
import { Context } from "koa";
import searchAndParse from "@/SDK/baidu";

/**
 * 搜索-接口
 **/
class SearchController extends BaseController {
  static async index(ctx: Context) {
    const { keyword } = ctx.request.query;
    const keywordText = keyword as string;

    let params: any = ctx.request.body;
    const newParams = {
      ...params,
      keyword: keywordText
    };

    ctx.verifyParams({
      keyword: {
        type: "string",
        required: true,
        min: 1,
        max: 255,
        message: {
          required: "关键字不能为空",
          min: "关键字不能小于1",
          max: "关键字不能超过255",
        }
      }
    }, {
      ...newParams
    })
    try {
      const result = await searchAndParse(keywordText);
      ctx.status = 200;
      ctx.body = resultSuccess({
        data: result
      });
    }
    catch (e) {
      // 异常处理，返回错误信息
      ctx.logger.error("搜索互联网异常", e); // 记录错误日志
      ctx.status = 500;
      const error: any = e;
      ctx.body = resultError({
        code: error?.code,
        message: error?.message || error,
      });
    }
  }
}

export default SearchController;
