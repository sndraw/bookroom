import LmList from '@/components/Lm/LmList';
import { MODE_ENUM } from '@/constants/DataMap';
import Page404 from '@/pages/404';
import ROUTE_MAP from '@/routers/routeMap';
import { queryAILmList } from '@/services/common/ai/lm';
import { generatePath, useNavigate, useParams, useRequest } from '@umijs/max';
import { useEffect } from 'react';
import styles from './index.less';

const AILmListPage: React.FC = () => {
  const { platform } = useParams();
  const navigate = useNavigate();

  // 模型列表-请求
  const { data, loading, run } = useRequest(
    () => {
      return queryAILmList({
        platform: platform || '',
      });
    },
    {
      manual: true,
    },
  );
  useEffect(() => {
    if (!platform) {
      return;
    }
    run();
  }, [platform]);

  if (!platform) {
    return <Page404 />;
  }
  return (
    <LmList
      mode={MODE_ENUM.EDIT}
      className={styles.pageContainer}
      platform={platform}
      changePlatform={(newPlatform) => {
        navigate(generatePath(ROUTE_MAP.AI_LM_LIST, { platform: newPlatform }));
      }}
      dataList={data?.list}
      loading={loading}
      refresh={run}
    />
  );
};

export default AILmListPage;
