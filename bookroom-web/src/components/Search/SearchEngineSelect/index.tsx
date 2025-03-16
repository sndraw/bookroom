import { Divider, Select } from 'antd';
import { useRequest } from '@umijs/max';
import { useEffect } from 'react';
import classNames from 'classnames';
import styles from './index.less';
import { querySearchEngineList } from '@/services/common/search';

type SearchEngineSelectPropsType = {
  title?: string;
  value?: string;
  onChange: (selected: any) => void;
  dataList?: any[];
  // 样式
  className?: string;
};
const SearchEngineSelect: React.FC<SearchEngineSelectPropsType> = (props) => {
  const { title, value, onChange, dataList, className } = props;

  // 模型列表-请求
  const { data, loading, run } = useRequest(
    () => {
      return querySearchEngineList();
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
        placeholder="请选择搜索引擎"
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

export default SearchEngineSelect;
