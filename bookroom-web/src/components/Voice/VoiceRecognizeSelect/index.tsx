import { Divider, Select } from 'antd';
import { useRequest } from '@umijs/max';
import { useEffect } from 'react';
import classNames from 'classnames';
import { queryVoiceRecognizeList } from '@/services/common/voice';
import styles from './index.less';

type VoiceRecognizeSelectPropsType = {
  title?: string;
  value?: string;
  onChange: (selected: any) => void;
  dataList?: any[];
  // 样式
  className?: string;
};
const VoiceRecognizeSelect: React.FC<VoiceRecognizeSelectPropsType> = (props) => {
  const { title, value, onChange, dataList, className } = props;

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

  return (
    <div className={classNames(styles.selectContainer, className)}>
      {title &&
        <>
          <span className={styles.title}>{title}</span>
          <Divider type="vertical" />
        </>
      }
      <Select<string>
        className={styles?.selectElement}
        value={value}
        placeholder="请选择语识别接口"
        allowClear
        // showSearch
        loading={loading}
        options={(dataList || data as any)?.map((item: any) => ({
          label: item.name,
          value: item.id,
        }))}
        onChange={onChange}
      />
    </div>
  );
};

export default VoiceRecognizeSelect;
