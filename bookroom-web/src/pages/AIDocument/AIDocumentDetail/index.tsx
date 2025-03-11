import DocumentDetail from '@/components/Document/DocumentDetail';
import Page404 from '@/pages/404';
import { getGraphDocument } from '@/services/common/ai/document';
import { useParams, useRequest } from '@umijs/max';
import { Alert, Divider, Empty, Space, Spin } from 'antd';
import { useEffect } from 'react';
import styles from './index.less';

const AIDocumentDetailPage: React.FC = () => {
  const { graph, workspace, document_id } = useParams();

  // 文档详情
  const { data, loading, error, run } = useRequest(
    () => {
      if (!graph || !document_id || !workspace) {
        return Promise.reject('Invalid parameters');
      }
      return getGraphDocument({
        graph,
        workspace,
        document_id,
      });
    },
    {
      manual: true,
    },
  );

  useEffect(() => {
    run();
  }, [graph, document_id]);

  if (!graph || !document_id) {
    return <Page404 title={'非法访问'} />;
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }
  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Alert message={error?.message} type="error" />
      </div>
    );
  }

  if (!data) {
    return <Empty description="暂无数据" />;
  }

  return (
    <div className={styles.container}>
      <Space size={0} wrap className={styles.header}>
        <Space size={0} wrap className={styles.documentTags}>
          <span>{graph}</span>
        </Space>
        <Divider type="vertical" />
        <Space size={0} wrap className={styles.documentTitle}>
          <span>{workspace}</span>
        </Space>
      </Space>
      <DocumentDetail
        document_id={document_id}
        document_data={data}
        className={styles.container}
      />
    </div>
  );
};

export default AIDocumentDetailPage;
