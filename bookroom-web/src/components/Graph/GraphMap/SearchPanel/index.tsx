import { Input } from 'antd';
import classNames from 'classnames';
import React from 'react';
import styles from './index.less';

// 添加props类型
interface SearchPanelProps {
  onSearch: (value: string) => void;
  className?: string;
}

const SearchPanel: React.FC<SearchPanelProps> = (props) => {
  const { onSearch, className } = props;
  return (
    <Input.Search
      className={classNames(styles.container, className)}
      placeholder="搜索节点"
      allowClear
      onSearch={(value) => {
        onSearch?.(value);
      }}
    />
  );
};

export default SearchPanel;
