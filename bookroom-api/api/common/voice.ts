// 支持的语音识别-接口类型-MAP
export const VOICE_RECOGNIZE_API_MAP: Record<string, { value: string; text: string }>  = {
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
