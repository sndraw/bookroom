import { Divider, Select } from 'antd';
import classNames from 'classnames';
import styles from './index.less';

type GraphSelectPropsType = {
  title?: string;
  datalist?: API.AIGraphInfo[] | null;
  graph?: string;
  changeGraph?: (graph: string) => void;
  // 样式
  className?: string;
};
const GraphSelect: React.FC<GraphSelectPropsType> = (props) => {
  const { title, datalist, graph, changeGraph, className } = props;

  return (
    <div className={classNames(styles.container, className)}>
      <span>{title || '知识图谱'}</span>
      <Divider type="vertical" />
      <Select<string>
        className={styles.selectElement}
        value={graph}
        placeholder="请选择知识图谱"
        allowClear={false}
        options={datalist?.map((item: any) => ({
          label: item.name,
          value: item.id,
        }))}
        onChange={(value) => {
          changeGraph?.(value as any);
        }}
      />
    </div>
  );
};

export default GraphSelect;
