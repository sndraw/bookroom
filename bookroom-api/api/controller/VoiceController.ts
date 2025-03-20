import { Context } from "koa";
import { resultError, resultSuccess } from "@/common/resultFormat";
import BaseController from "./BaseController";
import PlatformService from "@/service/PlatformService";
import { PLATFORM_TYPE_MAP } from "@/common/platform";
import VoiceService from "@/service/VoiceService";

class VoiceController extends BaseController {

    // 获取语音识别-接口列表
    static async queryVoiceRecognizeList(ctx: Context) {
        try {
            const platformList = await PlatformService.queryActivedRecords({
                type: PLATFORM_TYPE_MAP.voice_recognize.value
            });
            ctx.status = 200;
            ctx.body = resultSuccess({
                data: platformList
            });
        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("查询语音识别接口列表异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }
    // 获取语音识别信息
    static async getVoiceRecognizeInfo(ctx: Context) {
        // 从路径获取参数
        const { id } = ctx.params;
        if (!id) {
            throw new Error("ID不能为空");
        }
        try {
            // 查询语音识别接口信息
            const result = await PlatformService.findPlatformById(id);
            if (!result) {
                throw new Error("未找到指定的语音识别接口");
            }
            const data = result.toJSON();
            // 返回结果
            ctx.status = 200;
            ctx.body = resultSuccess({
                data
            });
        } catch (e) {
            // 异常处理，返回错误信息
            ctx.logger.error("查询语音识别接口信息异常", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e;
            ctx.body = resultError({
                code: error?.code,
                message: error?.message || error,
            });
        }
    }
    // 语音识别任务执行
    static async voiceRecognizeTask(ctx: Context) {
        const { id } = ctx.params;
        let params: any = ctx.request.body;
        if (typeof params === 'string') {
            // 将字符串转换为对象
            params = JSON.parse(params);
        }
        try {
            const { voiceData, task, language = 'zh' } = params || {};

            if (!id) {
                throw new Error('ID不能为空');
            }
            if (!voiceData) {
                throw new Error('缺少语音数据');
            }
            // 执行语音识别任务
            const result = await VoiceService.voiceRecognize({
                platform: id,
                audio: voiceData,
                language,
                task,
                userId: ctx?.userId
            });
            // 返回结果
            ctx.status = 200;
            ctx.body = resultSuccess({
                data: result
            });
            return;
        } catch (e: any) {
            // 异常处理，返回错误信息
            ctx.logger.error("语音识别异常：", e); // 记录错误日志
            ctx.status = 500;
            const error: any = e?.error || e;
            ctx.body = resultError({
                code: error?.code || error?.status_code,
                message: error?.message || error,
            });
        }
    }

}

export default VoiceController;