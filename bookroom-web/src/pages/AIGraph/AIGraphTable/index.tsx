import GraphTable from '@/components/Graph/GraphTable';
import Page404 from '@/pages/404';
import { queryGraphData } from '@/services/common/ai/graph';
import { useParams, useRequest } from '@umijs/max';
import { useEffect, useMemo } from 'react';
import styles from './index.less';
const AIGraphTablePage: React.FC = () => {
  const { graph, workspace } = useParams();

  // 模型数据-请求
  const { data, loading, run } = useRequest(
    () => {
      return queryGraphData({
        graph: graph || '',
        workspace: workspace || '',
      });
    },
    {
      manual: true,
    },
  );

  useEffect(() => {
    if (graph && workspace) {
      run();
    }
  }, [graph, workspace]);

  if (!graph || !workspace) {
    return <Page404 title={'非法访问'} />;
  }
  return (
    <GraphTable
      className={styles.pageContainer}
      graph={graph}
      workspace={workspace}
      graphData={data}
      loading={loading}
      refresh={run}
    ></GraphTable>
  );
};

export default AIGraphTablePage;
