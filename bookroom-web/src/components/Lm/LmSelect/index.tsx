import { Divider, Select } from 'antd';
import classNames from 'classnames';
import styles from './index.less';
import { useRequest } from '@umijs/max';
import { queryAILmList } from '@/services/common/ai/lm';
import { useEffect } from 'react';

type LmSelectPropsType = {
  title?: string;
  platform: string;
  model?: string;
  changeLm: (selected: any) => void;
  dataList?: any[];
  // 样式
  className?: string;
};
const LmSelect: React.FC<LmSelectPropsType> = (props) => {
  const { title, platform, model, changeLm, dataList, className } = props;

  // 模型列表-请求
  const { data, loading, run } = useRequest(
    () => {
      return queryAILmList({
        platform: platform || '',
      });
    },
    {
      manual: true,
    },
  );
  useEffect(() => {
    if (dataList) {
      return;
    }
    if (!platform) {
      return;
    }
    run();
  }, [platform]);

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
        value={model}
        placeholder="请选择模型"
        allowClear
        showSearch
        loading={loading}
        options={(dataList || data?.list as any)?.map((item: any) => ({
          label: item.name,
          value: item.model,
        }))}
        onChange={(value) => {
          const selected = value ? {
            platform: platform,
            model: value,
          } : false;
          changeLm(selected);
        }}
      />
    </div>
  );
};

export default LmSelect;
