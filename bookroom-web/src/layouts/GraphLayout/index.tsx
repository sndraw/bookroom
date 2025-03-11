import ROUTE_MAP from '@/routers/routeMap';
import { queryGraphList } from '@/services/common/ai/graph';
import {
  generatePath,
  Outlet,
  useModel,
  useNavigate,
  useParams,
  useRequest,
} from '@umijs/max';
import { Alert, Empty, Spin } from 'antd';
import { useEffect } from 'react';
import DefaultLayout from '../DefaultLayout';

export type PropsType = {
  children: JSX.Element;
  title: string;
};

const GraphLayout: React.FC<PropsType> = (props: PropsType) => {
  const { title } = props;
  const { setGraphList } = useModel('graphList');

  const navigate = useNavigate();
  const { graph } = useParams();
  // graph列表-请求
  const { data, loading, error, run } = useRequest(() => queryGraphList(), {
    manual: true,
    throwOnError: true,
  });
  useEffect(() => {
    run().then((resData) => {
      if (resData) {
        setGraphList(resData);
      }
    });
  }, []);

  useEffect(() => {
    if (data && data?.[0]?.name && !graph) {
      navigate(
        generatePath(ROUTE_MAP.AI_GRAPH_LIST, { graph: data?.[0]?.name }),
      );
    }
  }, [data, graph]);

  return (
    <DefaultLayout>
      <>
        {loading && (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Spin size="large" />
          </div>
        )}
        {error && (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Alert message={error.message} type="error" />
          </div>
        )}
        {!loading && !error && (
          <>
            {data && data?.length > 0 && <Outlet />}
            {(!data || data?.length < 1) && (
              <Empty description="请先进行系统配置" />
            )}
          </>
        )}
      </>
    </DefaultLayout>
  );
};
export default GraphLayout;
