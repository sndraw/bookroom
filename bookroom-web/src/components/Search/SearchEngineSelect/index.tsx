import { Divider, Select } from 'antd';
import { useRequest } from '@umijs/max';
import { useEffect, useMemo } from 'react';
import classNames from 'classnames';
import styles from './index.less';
import { querySearchEngineList } from '@/services/common/search';
import { SEARCH_API_MAP } from '@/common/search';

type SearchEngineSelectPropsType = {
  title?: string;
  placeholder?: string;
  searchCode?: string;
  value?: string;
  onChange: (selected: any) => void;
  dataList?: any[];
  // 样式
  className?: string;
};
const SearchEngineSelect: React.FC<SearchEngineSelectPropsType> = (props) => {
  const { title, placeholder, searchCode, value, onChange, dataList, className } = props;

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

  const filterList = useMemo(() => {
    const originaDataList = dataList || data;
    if (searchCode) {
      return originaDataList?.filter((item: any) => item.code === searchCode);
    } else {
      return originaDataList?.filter((item: any) => item.code !== SEARCH_API_MAP.weather.value);
    }
  }, [dataList, data, searchCode]);


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
        placeholder={placeholder || "请选择搜索引擎"}
        allowClear
        // showSearch
        loading={loading}
        options={(filterList)?.map((item: any) => ({
          label: item.name,
          value: item.id,
        }))}
        onChange={onChange}
      />
    </div>
  );
};

export default SearchEngineSelect;
