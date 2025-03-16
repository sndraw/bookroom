import {
  hasSpeekRunning,
  isTTSAvailable,
  startSpeak,
  stopSpeek,
} from '@/utils/tts';
import { AudioMutedOutlined, AudioOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { useEffect, useState } from 'react';

interface TextToSpeechProps {
  speekId: string;
  content: string;
}

const TextToSpeech: React.FC<TextToSpeechProps> = (props) => {
  const { speekId, content } = props;
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      stopSpeek();
      setIsSpeaking(false);
    };
  }, []);

  if (!isTTSAvailable() || !content || !content?.trim()) {
    return null;
  }

  return (
    <>
      {/* 语音播放 */}
      <Button
        type="link"
        size="small"
        onClick={() => {
          // 获取语音列表
          if (isSpeaking) {
            stopSpeek();
            setIsSpeaking(false);
            return;
          }
          // 如果其他语音正在播放，先停止
          if (hasSpeekRunning()) {
            stopSpeek();
          }
          startSpeak(content, {
            speekId: speekId,
            onstart: () => {
              setIsSpeaking(true);
            },
            onend: () => {
              setIsSpeaking(false);
            },
            onpause: () => {
              setIsSpeaking(false);
            },
            onresume: () => {
              setIsSpeaking(true);
            },
            onerror: (e: any) => {
              setIsSpeaking(false);
            },
          });
        }}
      >
        {isSpeaking ? <AudioMutedOutlined /> : <AudioOutlined />}
      </Button>
    </>
  );
};

export default TextToSpeech;
