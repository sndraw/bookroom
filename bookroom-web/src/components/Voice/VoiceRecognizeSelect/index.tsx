import { Divider, Select, Space } from 'antd';
import { useRequest } from '@umijs/max';
import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { queryVoiceRecognizeList } from '@/services/common/voice';
import styles from './index.less';
import { VOICE_RECOGNIZE_LANGUAGE_MAP, VOICE_RECOGNIZE_TASK_MAP } from '@/common/voice';

type VoiceRecognizeSelectPropsType = {
  value?: API.VoiceParametersType;
  onChange: (value: API.VoiceParametersType) => void;
  dataList?: any[];
  // 样式
  className?: string;
};
const VoiceRecognizeSelect: React.FC<VoiceRecognizeSelectPropsType> = (props) => {
  const { value, onChange, dataList, className } = props;
  const [platformId, setPlatformId] = useState('');
  const [task, setTask] = useState(VOICE_RECOGNIZE_TASK_MAP.transcribe.value);
  const [language, setLanguage] = useState(VOICE_RECOGNIZE_LANGUAGE_MAP.zh.value);


  // 模型列表-请求
  const { data, loading, run } = useRequest(
    () => {
      return queryVoiceRecognizeList();
    },
    {
      manual: true,
    },
  );

  useEffect(() => {
    if (dataList) {
      return;
    }
    run();
  }, []);
  useEffect(() => {
    if (value) {
      setPlatformId(value?.id || '');
      setLanguage(value?.language || '');
      setTask(value?.task || '');
    }
  }, [value]);

  useEffect(() => {
    if (!platformId) {
      onChange(null);
      return;
    }
    onChange({
      id: platformId,
      language: language,
      task: task,
    });
  }, [platformId, task, language]);

  return (
    <Space wrap size={10} direction={'vertical'} className={classNames(styles.selectContainer, className)}>
      <Select<string>
        className={styles?.selectElement}
        value={platformId}
        onChange={setPlatformId}
        placeholder="请选择语识别接口"
        allowClear
        // showSearch
        loading={loading}
        options={(dataList || data as any)?.map((item: any) => ({
          label: item.name,
          value: item.id,
        }))}
      />
      {/* 任务类型*/}
      <Select<string>
        className={styles?.selectElement}
        value={task}
        onChange={setTask}
        placeholder="请选择任务类型"
        loading={loading}
        options={Object.entries(VOICE_RECOGNIZE_TASK_MAP)?.map((item: any) => ({
          label: item[1]?.text,
          value: item[1]?.value,
        }))}
      />
      {/* 目标语言*/}
      <Select<string>
        className={styles?.selectElement}
        value={language}
        onChange={setLanguage}
        placeholder="请选择目标语言"
        showSearch
        loading={loading}
        options={Object.entries(VOICE_RECOGNIZE_LANGUAGE_MAP)?.map((item: any) => ({
          label: item[1]?.text,
          value: item[1]?.value,
        }))}
      />
    </Space>
  );
};

export default VoiceRecognizeSelect;
