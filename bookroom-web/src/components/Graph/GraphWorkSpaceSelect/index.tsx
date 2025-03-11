import { useEffect } from 'react';
// import { AppstoreOutlined } from '@ant-design/icons';
import { useRequest } from '@umijs/max';
import { Divider, Select } from 'antd';
import classNames from 'classnames';
import styles from './index.less';

type GraphWorkspaceSelectPropsType = {
  title?: string;
  graph: string;
  workspace?: string;
  changWorkspace: (workspace: string) => void;
  customRequest: (params: { graph: string }) => Promise<any>;
  // 样式
  className?: string;
};
const GraphWorkspaceSelect: React.FC<GraphWorkspaceSelectPropsType> = (
  props,
) => {
  const { title, graph, workspace, changWorkspace, customRequest, className } =
    props;
  // graph列表-请求
  const { data, loading, run } = useRequest(
    () =>
      customRequest({
        graph,
      }),
    {
      manual: true,
      throwOnError: true,
    },
  );

  useEffect(() => {
    run().then((data) => {
      if (graph && workspace) {
        return;
      }
      changWorkspace(data?.[0]?.id);
    });
  }, []);

  return (
    <div className={classNames(styles.container, className)}>
      <span>{title || '图谱空间'}</span>
      <Divider type="vertical" />
      <Select<string>
        className={styles.selectElement}
        loading={loading}
        value={workspace}
        placeholder="请选择图谱空间"
        allowClear={false}
        options={(data as any)?.map((item: any) => ({
          label: item.name,
          value: item.id,
        }))}
        onChange={(value) => changWorkspace(value as any)}
      />
    </div>
  );
};

export default GraphWorkspaceSelect;
