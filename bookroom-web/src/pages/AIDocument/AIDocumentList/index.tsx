import DocumentList from '@/components/Document/DocumentList';
import Page404 from '@/pages/404';
import { queryGraphDocumentList } from '@/services/common/ai/document';
import { useParams, useRequest } from '@umijs/max';
import { Alert, Empty, Spin } from 'antd';
import { useEffect } from 'react';
import styles from './index.less';
const AIDocumentListPage: React.FC = () => {
  const { graph, workspace } = useParams();

  // 文档列表
  const {
    data,
    loading,
    error,
    run,
  } = useRequest(
    () => {
      if (!graph || !workspace) {
        return Promise.reject('Invalid parameters');
      }
      return queryGraphDocumentList({
        graph,
        workspace: encodeURIComponent(workspace),
      });
    },
    {
      manual: true,
    },
  );

  useEffect(() => {
    run();
  }, [graph, workspace]);


  if (!graph || !workspace) {
    return <Page404 title={'非法访问'} />;
  }

  return (
    <DocumentList
      className={styles.pageContainer}
      graph={graph}
      workspace={workspace || ''}
      dataList={data}
      loading={loading}
      refresh={run}
    />
  );
};

export default AIDocumentListPage;
