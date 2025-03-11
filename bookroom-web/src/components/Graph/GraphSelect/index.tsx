import { useModel } from '@umijs/max';
import { Divider, Select } from 'antd';
import classNames from 'classnames';
import { useEffect } from 'react';
import styles from './index.less';

type GraphSelectPropsType = {
  title?: string;
  graph?: string;
  changeGraph?: (graph: string) => void;
  // 样式
  className?: string;
};
const GraphSelect: React.FC<GraphSelectPropsType> = (props) => {
  const { title, graph, changeGraph, className } = props;
  const { graphList } = useModel('graphList');

  useEffect(() => {
    if (graph) {
      return;
    }
    if (graphList?.[0]?.name) {
      changeGraph?.(graphList?.[0]?.name);
    }
  }, []);

  return (
    <div className={classNames(styles.container, className)}>
      <span>{title || '知识图谱'}</span>
      <Divider type="vertical" />
      <Select<string>
        className={styles.selectElement}
        value={graph}
        placeholder="请选择知识图谱"
        allowClear={false}
        options={(graphList as any)?.map((item: any) => ({
          label: item.name,
          value: item.name,
        }))}
        onChange={(value) => {
          changeGraph?.(value as any);
        }}
      />
    </div>
  );
};

export default GraphSelect;
