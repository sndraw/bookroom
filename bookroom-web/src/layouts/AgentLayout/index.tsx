import {
  Outlet,
  useModel,
  useRequest,
} from '@umijs/max';
import { Alert, Spin } from 'antd';
import { useEffect } from 'react';
import DefaultLayout from '../DefaultLayout';
import { queryAgentPlatformList } from '@/services/common/agent';

export type PropsType = {
  children: JSX.Element;
  title: string;
};

const AgentLayout: React.FC<PropsType> = (props: PropsType) => {
  const { title } = props;
  const { setPlatformList } = useModel('agentplatformList');

  // 智能助手列表-请求
  const { data, loading, error, run } = useRequest(() => queryAgentPlatformList(), {
    manual: true,
    throwOnError: true,
  });

  useEffect(() => {
    run().then((resData) => {
      if (resData) {
        setPlatformList(resData);
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
            <Outlet />
            {/* {data && data?.length > 0 && <Outlet />}
            {(!data || data?.length < 1) && (
              <Empty description="请前往【系统配置】添加【智能助手-接口类型】" />
            )} */}
          </>
        )}
      </>
    </DefaultLayout>
  );
};
export default AgentLayout;
