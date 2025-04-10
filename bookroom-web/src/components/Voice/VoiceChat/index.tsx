import { AudioMutedOutlined, AudioOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import { Button, message } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import styles from './index.less';
import { VOICE_RECOGNIZE_TASK_MAP } from '@/common/voice';

interface VoiceChatProps {
  voiceParams?: API.VoiceParamsType,
  className?: string;
  onRecordStart?: () => void;
  onRecordStop?: (audioBlobUrl: string | Blob | null) => void;
  disabled?: boolean;
}

const VoiceChat: React.FC<VoiceChatProps> = (props) => {
  const { voiceParams, className, onRecordStart, onRecordStop, disabled } = props;

  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);

  const mediaRecorderRef = useRef<any>(null);
  const audioChunksBlob = useRef<Blob[]>([]);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);

  // 开始录音
  const startRecording = async () => {
    try {
      // 开始录音
      setIsRecording(true);
      // 加载麦克风
      setLoading(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      if (!mediaRecorderRef.current) {
        mediaRecorderRef.current = new MediaRecorder(stream);
      }

      mediaRecorderRef.current.ondataavailable = (event: { data: Blob }) => {
        console.log('音频数据可用:', event.data);
        const prevChunks = audioChunksBlob.current;
        audioChunksBlob.current = [...prevChunks, event.data];
      };
      mediaRecorderRef.current.onerror = (error: any) => {
        console.error('录音报错: ', error);
        message.error('录音失败，请重试');
        setIsRecording(false);
      };

      mediaRecorderRef.current.onstart = () => {
        console.log('录音开始');
        onRecordStart?.();
      };
      mediaRecorderRef.current.onpause = () => {
        console.error('录音暂停');
        setIsRecording(false);
      };
      mediaRecorderRef.current.onresume = () => {
        console.error('录音恢复');
        setIsRecording(true);
      };
      mediaRecorderRef.current.onstop = () => {
        const audioChunks = [...audioChunksBlob.current];
        audioChunksBlob.current = []; // 清空音频块数组以准备下一次录音
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        console.log('音频停止');
        // 停止语音权限
        stream.getTracks().forEach((track) => track.stop());

        // // 生成语音文件
        // const audioUrl = URL.createObjectURL(audioBlob);
        // setAudioBlobUrl(audioUrl);

        // 处理语音数据
        onRecordStop?.(audioBlob);

        setIsRecording(false);
      };
      setAudioBlobUrl(null); // 初始化音频URL为空
      mediaRecorderRef.current?.start();
    } catch (err: any) {
      const msg = "无法访问麦克风"
      setIsRecording(false);
      message.error(msg);
      console.error(`${msg}: ${err}`);
    } finally {
      // 完成加载状态
      setLoading(false);
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive'
    ) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      setIsRecording(false);
    } else {
      console.log('未在录音');
    }
  };
  useEffect(() => {
    return () => {
      if (audioBlobUrl) {
        URL.revokeObjectURL(audioBlobUrl);
        setAudioBlobUrl(null); // 清空音频URL以避免内存泄漏
      }
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current = null; // 清空引用以避免内存泄漏
      }
      if (audioChunksBlob.current) {
        audioChunksBlob.current = []; // 清空音频块数组以避免内存泄漏
      }
    };
  }, []);
  const icons = {
    start: voiceParams?.apiMode ? <CustomerServiceOutlined /> : <AudioOutlined />,
    stop: voiceParams?.apiMode ? <CustomerServiceOutlined style={{ color: 'red' }} /> : <AudioMutedOutlined style={{ color: 'red' }} />,
  };
  let titleText = "语音录制"
  if (voiceParams?.apiMode && voiceParams?.task) {
    titleText = VOICE_RECOGNIZE_TASK_MAP?.[voiceParams.task]?.text || "语音识别"
  }
  const btnTitle = {
    start: voiceParams?.apiMode ? `开始${titleText}` : `开始${titleText}`,
    stop: voiceParams?.apiMode ? `停止${titleText}` : `停止${titleText}`,
  }
  return (
    <div className={classNames(styles.voiceChatContainer, className)}>
      <Button
        disabled={disabled || loading}
        type="link"
        size={'large'}
        className={styles.voiceChatBtn}
        title={!isRecording ? btnTitle.start : btnTitle.stop}
        onClick={!isRecording ? startRecording : stopRecording}
      >
        {!isRecording ? icons?.start : icons?.stop}
      </Button>
      {/* {audioBlobUrl && (
        <video className={styles.voiceChatVideo} controls autoPlay src={audioBlobUrl} />
      )} */}
    </div>
  );
};

export default VoiceChat;
