import { Button } from 'antd';
import React, { useEffect, useRef, useState } from 'react';

interface SpeechToTextProps {
  onResult?: (text: string) => void;
}

const SpeechToText: React.FC<SpeechToTextProps> = (props) => {
  const { onResult } = props;
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>('');
  const recognitionRef = useRef<any>(null);

  const startRecording = async () => {
    if (recognitionRef.current && !isRecording) {
      recognitionRef.current.start();
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current =
        new (window as any).webkitSpeechRecognition() ||
        (window as any).speechRecognition;
      if (recognitionRef.current) {
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'zh-CN';
        recognitionRef.current.onresult = (event: {
          resultIndex: any;
          results: string | any[];
        }) => {
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              setTranscript((prev) => prev + event.results[i][0].transcript);
            }
          }
        };

        recognitionRef.current.onerror = (event: { error: any }) => {
          setIsRecording(false);
          console.error('语音识别错误:', event.error);
        };
        recognitionRef.current.onstart = () => {
          setIsRecording(true);
          console.log('语音识别开始');
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
          console.log('语音识别结束');
        };
      }
    } else {
      console.error('浏览器不支持语音识别功能');
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      }
    };
  }, []);

  return (
    <div>
      <h1>语音转文字</h1>
      <Button disabled={isRecording} onClick={startRecording}>
        开始录音
      </Button>
      <Button disabled={!isRecording} onClick={stopRecording}>
        停止录音
      </Button>
      <p>{transcript}</p>
    </div>
  );
};

export default SpeechToText;
