import { AI_LM_PLATFORM_MAP } from "@/common/ai";
import PlatformService from "./PlatformService";
import OpenAIAPI from "../SDK/openai";
import { VOICE_RECOGNIZE_API_MAP } from "@/common/voice";

class VoiceService {
    // 语音识别
    static async voiceRecognize(params: any) {
        const { platform, audio, task, language } = params

        if (!platform) {
            throw new Error("参数错误");
        }
        if (!audio) {
            throw new Error("参数错误");
        }
        if (!language) {
            throw new Error("参数错误");
        }
        // 获取平台
        const platformConfig: any = await PlatformService.findPlatformByIdOrName(platform, {
            safe: false
        });
        if (!platformConfig) {
            throw new Error("接口不存在");
        }

        let result: any;
        switch (platformConfig?.code) {
            case VOICE_RECOGNIZE_API_MAP.openai.value:
                return await new OpenAIAPI(platformConfig?.toJSON()).getVoiceRecognize({
                    model: platformConfig?.parameters?.model,
                    audio,
                    language,
                    task
                })
                break;
            default:
                result = ""
                break;
        }
        return result
    }

}
export default VoiceService;