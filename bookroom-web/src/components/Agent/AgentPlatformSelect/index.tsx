import { useModel } from '@umijs/max';
import { Divider, Select } from 'antd';
import classNames from 'classnames';
import { useEffect } from 'react';
import styles from './index.less';

type AgentSelectPropsType = {
  title?: string;
  platform?: string;
  changePlatform?: (platform: string) => void;
  allowClear?: boolean;
  // 样式
  className?: string;
};
const AgentSelect: React.FC<AgentSelectPropsType> = (props) => {
  const { title, platform, changePlatform, allowClear = false, className } = props;
  const { platformList } = useModel('agentplatformList');

  useEffect(() => {
    if (platform) {
      return;
    }
    if (platformList?.[0]?.name) {
      changePlatform?.(platformList?.[0]?.name);
    }
  }, []);

  return (
    <div className={classNames(styles.container, className)}>
      <span>{title || '智能助手'}</span>
      <Divider type="vertical" />
      <Select<string>
        className={styles.selectElement}
        value={platform}
        placeholder="请选择Agent"
        allowClear={allowClear}
        options={(platformList as any)?.map((item: any) => ({
          label: item.name,
          value: item.name,
        }))}
        onChange={(value) => changePlatform?.(value as any)}
      />
    </div>
  );
};

export default AgentSelect;
