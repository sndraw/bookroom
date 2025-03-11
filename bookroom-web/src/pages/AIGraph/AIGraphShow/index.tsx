import GraphDisplay from '@/components/Graph/GraphDisplay';
import { MODE_ENUM } from '@/constants/DataMap';
import Page404 from '@/pages/404';
import { queryGraphData } from '@/services/common/ai/graph';
import { useParams, useRequest } from '@umijs/max';
import { useEffect } from 'react';
import styles from './index.less';
const AIGraphShowPage: React.FC = () => {
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
    <GraphDisplay
      className={styles.pageContainer}
      mode={MODE_ENUM.EDIT}
      graph={graph}
      workspace={workspace}
      graphData={data}
      loading={loading}
      refresh={run}
    ></GraphDisplay>
  );
};

export default AIGraphShowPage;
