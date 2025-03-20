
declare namespace API {
    // 语音识别参数
    type VoiceParametersType = {
        apiMode?: boolean; // 是否使用API模式，默认为false
        id?: string;
        language?: string; //默认目标语言， zh: 中文, en: 英文
        task?: string; // 任务类型， transcribe: 语音识别,translate: 语音转译，
        voiceData?: any; // 音频数据 或者 音频地址
    } | null | undefined;
}