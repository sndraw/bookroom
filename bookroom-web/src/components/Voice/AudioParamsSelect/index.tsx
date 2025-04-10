import classNames from 'classnames';
import React, { useEffect, useRef, useState } from 'react';
import { ChatCompletionAudioParam, ChatCompletionAudioParam_Format_MAP, ChatCompletionAudioParam_Voice_MAP } from '@/common/voice';
import styles from './index.less';
import { Select, Space, Switch } from 'antd';

export type AudioParamsType = {
  output: boolean;// 是否允许模型输出音频
  autoPlay: boolean;// 是否生成后自动播放
  format: ChatCompletionAudioParam["format"];
  voice: ChatCompletionAudioParam["voice"];
} | null | undefined

interface AudioParamsSelectProps {
  value?: AudioParamsType;
  onChange: (value: AudioParamsType) => void;
  className?: string;
}

const AudioParamsSelect: React.FC<AudioParamsSelectProps> = (props) => {
  const { value, onChange, className } = props;
  const [output, setOutput] = useState(false);
  const [autoPlay, setAutoPlay] = useState(false);
  const [format, setFormat] = useState<ChatCompletionAudioParam["format"]>('wav');
  const [voice, setVoice] = useState<ChatCompletionAudioParam["voice"]>('Chelsie');
  useEffect(() => {
    if (value) {
      setOutput(value?.output || false);
      setAutoPlay(value?.autoPlay || false);
      setFormat(value?.format || 'wav');
      setVoice(value?.voice || 'Chelsie');
    }
  }, []);

  useEffect(() => {
    onChange({
      output: output,
      autoPlay: autoPlay,
      format: format,
      voice: voice,
    });
  }, [output, autoPlay, format, voice]);

  return (
    <Space wrap size={10} direction={'vertical'} className={classNames(styles.selectContainer, className)}>
      <Switch
        className={styles?.switchElement}
        value={output}
        onChange={setOutput}
        checkedChildren="启用"
        unCheckedChildren="禁用"
      />
      {output && (
        <>
          {/* <Switch
            className={styles?.switchElement}
            value={autoPlay}
            onChange={setAutoPlay}
            checkedChildren="启用自动播放"
            unCheckedChildren="禁用自动播放"
          /> */}
          <Select<ChatCompletionAudioParam["format"]>
            className={styles?.selectElement}
            value={format}
            onChange={setFormat}
            placeholder="请选择音频格式"
            options={Object.entries(ChatCompletionAudioParam_Format_MAP)?.map((item: any) => ({
              label: item[1],
              value: item[1],
            }))}
          />
          <Select<ChatCompletionAudioParam["voice"]>
            className={styles?.selectElement}
            value={voice}
            onChange={setVoice}
            placeholder="请选择音色"
            showSearch
            options={Object.entries(ChatCompletionAudioParam_Voice_MAP)?.map((item: any) => ({
              label: item[1],
              value: item[1],
            }))}
          />
        </>
      )}
    </Space>
  );
};

export default AudioParamsSelect;
