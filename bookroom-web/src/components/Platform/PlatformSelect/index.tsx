import { useModel } from '@umijs/max';
import { Divider, Select, Space } from 'antd';
import classNames from 'classnames';
import { useEffect } from 'react';
import styles from './index.less';

type PlatformSelectPropsType = {
  title?: string;
  dataList?:API.PlatformInfo[] | null;
  platform?: string;
  changePlatform: (platform: string) => void;
  allowClear?: boolean;
  // 样式
  className?: string;
};
const PlatformSelect: React.FC<PlatformSelectPropsType> = (props) => {
  const {
    title,
    dataList,
    platform,
    allowClear = false,
    changePlatform,
    className,
  } = props;


  return (
    <Space size={0} className={classNames(styles.selectContainer, className)}>
      <span className={styles.title}>{title || '平台'}</span>
      <Divider type="vertical" />
      {/* <AppstoreOutlined /> */}
      {/* <Divider type="vertical" /> */}
      <Select<string>
        className={styles?.selectElement}
        value={platform}
        placeholder="请选择平台"
        allowClear={allowClear}
        options={dataList?.map((item: any) => ({
          label: item.name,
          value: item.id,
        }))}
        onChange={(value) => changePlatform(value as any)}
      />
    </Space>
  );
};

export default PlatformSelect;
