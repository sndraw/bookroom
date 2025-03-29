import React, { useEffect } from 'react';
import PlatformList from '@/components/Platform/PlatformList';
import styles from './index.less';
import DefaultLayout from '@/layouts/DefaultLayout';
import { useRequest } from '@umijs/max';
import { queryPlatformList } from '@/services/common/platform';

const PlatformPage: React.FC = () => {

  // Agent列表-请求
  const { data, loading, run } = useRequest(
    () => {
      return queryPlatformList();
    },
    {
      manual: true,
    },
  );

  useEffect(() => {
    run();
  }, []);

  return (
    <DefaultLayout>
      <PlatformList
        dataList={data?.list || []}
        refresh={run}
        loading={loading}
        className={styles.pageContainer}
      />
    </DefaultLayout>
  )
};

export default PlatformPage;
