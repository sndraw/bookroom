import { useModel } from '@umijs/max';
import { Divider, Select } from 'antd';
import classNames from 'classnames';
import { useEffect } from 'react';
import styles from './index.less';

type AgentSelectPropsType = {
  title?: string;
  graph?: string;
  changeAgent?: (graph: string) => void;
  // 样式
  className?: string;
};
const AgentSelect: React.FC<AgentSelectPropsType> = (props) => {
  const { title, graph, changeAgent, className } = props;
  const { graphList } = useModel('graphList');

  useEffect(() => {
    if (graph) {
      return;
    }
    if (graphList?.[0]?.name) {
      changeAgent?.(graphList?.[0]?.name);
    }
  }, []);

  return (
    <div className={classNames(styles.container, className)}>
      <span>{title || 'Agent列表'}</span>
      <Divider type="vertical" />
      <Select<string>
        className={styles.selectElement}
        value={graph}
        placeholder="请选择Agent"
        allowClear={false}
        options={(graphList as any)?.map((item: any) => ({
          label: item.name,
          value: item.name,
        }))}
        onChange={(value) => {
          changeAgent?.(value as any);
        }}
      />
    </div>
  );
};

export default AgentSelect;
