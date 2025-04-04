interface LLMTypeMap {
    [key: string]: { value: string; text: string };
}
// 大模型分类-MAP
export const LLM_TYPE_MAP:LLMTypeMap = {
    TG: {
        value: 'TG',
        text: '文本生成',
    },
    OMNI: {
        value: 'OMNI',
        text: '全模态',
    },
    QwQ: {
        value: 'QwQ',
        text: '推理模型',
    },
    AU: {
        value: 'AU',
        text: '音频理解',
    },
    VU: {
        value: 'VU',
        text: '视频理解',
    },
    VG: {
        value: 'VG',
        text: '视频生成',
    },
    IP: {
        value: 'IP',
        text: '图片处理',
    },
    IU: {
        value: 'IU',
        text: '图片理解',
    },
    IM: {
        value: 'IM',
        text: '图像模型',
    },
    TR: {
        value: 'TR',
        text: '向量模型',
    },
    TTS: {
        value: 'TTS',
        text: '语音合成',
    },
    ASR: {
        value: 'ASR',
        text: '语音识别',
    },
    RK: {
        value: 'RK',
        text: '排序模型',
    },
};


// 大模型-特殊标识-MAP
export const LLM_FLAG_MAP = {
    USER: {
        value: 'USER',
        text: '用户添加',
    },
    SYS: {
        value: 'SYS',
        text: '系统默认'
    }
}