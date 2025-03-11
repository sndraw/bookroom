import ROUTE_MAP from '@/routers/routeMap';
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
import { queryAgentList } from '@/services/common/agent';

export type PropsType = {
  children: JSX.Element;
  title: string;
};

const AgentLayout: React.FC<PropsType> = (props: PropsType) => {
  const { title } = props;
  const { setAgentList } = useModel('agentList');

  const navigate = useNavigate();
  const { agent } = useParams();
  // graph列表-请求
  const { data, loading, error, run } = useRequest(() => queryAgentList(), {
    manual: true,
    throwOnError: true,
  });
  useEffect(() => {
    run().then((resData) => {
      if (resData) {
        setAgentList(resData);
      }
    });
  }, []);

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
export default AgentLayout;
