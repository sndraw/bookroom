// 支持的语音识别-接口类型-MAP
export const VOICE_RECOGNIZE_API_MAP: Record<string, { value: string; text: string }> = {
    openai: {
        value: 'OpenAI',
        text: 'OpenAI'
    },
    google: {
        value: 'Google',
        text: 'Google'
    },
}

// 支持的语音识别-任务类型-MAP
export const VOICE_RECOGNIZE_TASK_MAP: Record<string, { value: string; text: string }> = {
    transcribe: {
        value: 'transcribe',
        text: '语音识别'
    },
    translate: {
        value: 'translate',
        text: '语音转译'
    },
}


// 支持的语音识别-语言类型-MAP
export const VOICE_RECOGNIZE_LANGUAGE_MAP: Record<string, { value: string; text: string }> = {
    zh: {
        value: 'zh',
        text: '中文'
    },
    en: {
        value: 'en',
        text: 'English'
    },
}
// 音频格式类型
export const ChatCompletionAudioParam_Format_MAP = ['wav', 'mp3', 'flac', 'opus', 'pcm16'];
// 音频音色风格
export const ChatCompletionAudioParam_Voice_MAP = [
    'Cherry',
    'Serena',
    'Ethan',
    'Chelsie',
    'alloy',
    'ash',
    'ballad',
    'coral',
    'echo',
    'fable',
    'onyx',
    'nova',
    'sage',
    'shimmer',
    'verse'
];

export interface ChatCompletionAudioParam {
    /**
     * Specifies the output audio format. Must be one of `wav`, `mp3`, `flac`, `opus`,
     * or `pcm16`.
     */
    format: 'wav' | 'mp3' | 'flac' | 'opus' | 'pcm16';

    /**
     * The voice the model uses to respond. Supported voices are `alloy`, `ash`,
     * `ballad`, `coral`, `echo`, `sage`, and `shimmer`.
     */
    voice:
    | (string & {})
    | 'alloy'
    | 'ash'
    | 'ballad'
    | 'coral'
    | 'echo'
    | 'fable'
    | 'onyx'
    | 'nova'
    | 'sage'
    | 'shimmer'
    | 'verse';
}
