import { instance } from 'three/tsl';

export const currentTTSInstance: any = {
  instance: null,
  text: null,
};

export const getCurrentSpeek: any = () => {
  return {
    instance: currentTTSInstance?.instance,
    speekId: currentTTSInstance?.speekId,
  };
};

export const setCurrentSpeek = (instance: any, speekId: any) => {
  currentTTSInstance.instance = instance;
  currentTTSInstance.speekId = speekId;
};

export const clearCurrentSpeek = () => {
  currentTTSInstance.instance = null;
  currentTTSInstance.speekId = null;
};

// 判定是否支持文本转语音功能
export const isTTSAvailable = () => {
  return !!window.speechSynthesis;
};

// 获取所有可用的语音选项
export const getVoices = () => {
  if (window.speechSynthesis) {
    return window.speechSynthesis.getVoices();
  }
  return null;
};

// 获取当前选中的语音选项
export const getSelectedVoice = (lang = 'zh-CN') => {
  if (window.speechSynthesis) {
    const voices = getVoices();
    const selectedVoice =
      voices?.find((v) => v.localService === true && v.lang === lang) ||
      voices?.[0];
    return selectedVoice || null;
  }
  return null;
};

// 开启文本转语音功能
export const startSpeak = (text: string, options?: any) => {
  const {
    speekId,
    lang = 'zh-CN',
    onstart,
    onend,
    onpause,
    onresume,
    onerror,
  } = options || {};
  if (window.speechSynthesis) {
    if (!text.trim()) {
      console.warn('文本内容不能为空');
      return null;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = getSelectedVoice(lang);
    // 设置语速、音调和音量（可选）
    utterance.rate = 1; // 语速，默认值是1
    utterance.pitch = 1; // 音调，默认值是1
    window.speechSynthesis.speak(utterance);
    utterance.onstart = () => {
      onstart?.();
    };
    utterance.onend = () => {
      onend?.();
      console.log('end');
    };
    utterance.onpause = () => {
      onpause?.();
      console.log('pause');
    };
    utterance.onresume = () => {
      onresume?.();
    };
    utterance.onerror = (error) => {
      onerror?.(error);
    };
    setCurrentSpeek(instance, speekId);
  } else {
    console.error('浏览器不支持 speechSynthesis API');
    return null;
  }
};

// 停止播放
export const stopSpeek = () => {
  if (window.speechSynthesis) {
    clearCurrentSpeek();
    window.speechSynthesis.cancel();
    console.log('语音合成已停止。');
  }
};

// 暂停播放
export const pauseSpeak = () => {
  if (window.speechSynthesis?.speaking) {
    window.speechSynthesis.pause();
  }
};

// 恢复播放
export const resumeSpeak = () => {
  if (window.speechSynthesis?.paused) {
    window.speechSynthesis.resume();
  } else {
    console.error('浏览器不支持 speechSynthesis API');
  }
};

// 监听语音是否在播放
export const hasSpeekRunning = () => {
  if (window.speechSynthesis) {
    return window.speechSynthesis.speaking || window.speechSynthesis.pending;
  } else {
    console.error('浏览器不支持 speechSynthesis API');
    return false;
  }
};
