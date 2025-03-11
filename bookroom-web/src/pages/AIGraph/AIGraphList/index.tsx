import GraphList from '@/components/Graph/GraphList';
import { MODE_ENUM } from '@/constants/DataMap';
import Page404 from '@/pages/404';
import ROUTE_MAP from '@/routers/routeMap';
import { queryGraphWorkspaceList } from '@/services/common/ai/graph';
import { generatePath, useNavigate, useParams, useRequest } from '@umijs/max';
import { useEffect } from 'react';
import styles from './index.less';

const AIGraphListPage: React.FC = () => {
  const { graph } = useParams();
  const navigate = useNavigate();

  // 图谱空间列表-请求
  const { data, loading, run } = useRequest(
    () => {
      return queryGraphWorkspaceList({
        graph: graph || '',
      });
    },
    {
      manual: true,
    },
  );
  useEffect(() => {
    if (!graph) {
      return;
    }
    run();
  }, [graph]);

  if (!graph) {
    return <Page404 />;
  }
  return (
    <GraphList
      className={styles.pageContainer}
      mode={MODE_ENUM.EDIT}
      graph={graph}
      changeGraph={(newGraph) => {
        navigate(generatePath(ROUTE_MAP.AI_GRAPH_LIST, { graph: newGraph }));
      }}
      dataList={data || []}
      loading={loading}
      refresh={run}
    ></GraphList>
  );
};

export default AIGraphListPage;
