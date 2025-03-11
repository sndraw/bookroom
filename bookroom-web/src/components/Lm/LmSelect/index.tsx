import { Divider, Select } from 'antd';
import classNames from 'classnames';
import { useEffect } from 'react';
import styles from './index.less';

type LmSelectPropsType = {
  title?: string;
  platform: string;
  model?: string;
  changeLm: (model: string) => void;
  dataList?: any[];
  // 样式
  className?: string;
};
const LmSelect: React.FC<LmSelectPropsType> = (props) => {
  const { title, platform, model, changeLm, dataList, className } = props;

  useEffect(() => {
    if (model) {
      return;
    }
    changeLm(dataList?.[0]?.name);
  }, [dataList]);

  return (
    <div className={classNames(styles.selectContainer, className)}>
      <span className={styles.title}>{title || '模型'}</span>
      <Divider type="vertical" />
      <Select<string>
        className={styles?.selectElement}
        value={model}
        placeholder="请选择模型"
        // allowClear
        options={(dataList as any)?.map((item: any) => ({
          label: item.name,
          value: item.model,
        }))}
        onChange={(value) => changeLm(value as any)}
      />
    </div>
  );
};

export default LmSelect;
