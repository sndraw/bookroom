import ROUTE_MAP from '@/routers/routeMap';
import { queryAILmPlatformList } from '@/services/common/ai/lm';
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

const LmLayout: React.FC<PropsType> = (props: PropsType) => {
  const { title } = props;
  const { setPlatformList } = useModel('lmplatformList');

  const navigate = useNavigate();
  const { platform } = useParams();
  // graph列表-请求
  const { data, loading, error, run } = useRequest(
    () => queryAILmPlatformList(),
    {
      manual: true,
      throwOnError: true,
    },
  );
  useEffect(() => {
    run().then((resData) => {
      if (resData) {
        setPlatformList(resData);
      }
    });
  }, []);

  useEffect(() => {
    if (data && data?.[0]?.name && !platform) {
      navigate(
        generatePath(ROUTE_MAP.AI_LM_LIST, { platform: data?.[0]?.name }),
      );
    }
  }, [data, platform]);

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
export default LmLayout;
