import { Space, Typography } from 'antd';
import classNames from 'classnames';
import styles from './index.less';

const { Title, Paragraph, Text } = Typography;
// 添加props类型
interface DocumentDetailProps {
  document_id: string;
  document_data: API.AIGraphDocumentInfo;
  className?: string;
}

const DocumentDetail: React.FC<DocumentDetailProps> = (props) => {
  const { document_id, document_data, className } = props;
  const { document, doc_status_document, chunks } = document_data || {};

  return (
    <div className={classNames(styles.documentDetail, className)}>
      <Title level={4}>文档信息</Title>
      <Paragraph>
        <ul>
          <li>
            <label className={styles.label}>文档ID：</label>
            {document_id}
          </li>
          {/* <li>
            <label className={styles.label}>创建时间：</label>
            {new Date(doc_status_document.created_at).toLocaleString()}
          </li> */}
          <li>
            <label className={styles.label}>更新时间：</label>
            {new Date(doc_status_document.updated_at).toLocaleString()}
          </li>
          <li>
            <label className={styles.label}>处理状态：</label>
            {doc_status_document.status}
          </li>
          {doc_status_document.error && (
            <li>
              <label className={styles.label}>失败因由：</label>
              {doc_status_document.error}
            </li>
          )}
          <li>
            <label className={styles.label}>片段数量：</label>
            {doc_status_document.chunks_count}
          </li>
        </ul>
      </Paragraph>
      <Paragraph>
        <Title level={4}>摘要</Title>
        <pre>{doc_status_document.content_summary}</pre>
      </Paragraph>
      {document && (
        <>
          <Title level={4}>文档内容</Title>
          <Paragraph>
            <pre>{document?.content}</pre>
          </Paragraph>
        </>
      )}
      {chunks?.length > 0 && (
        <>
          <Title level={4}>文档片段</Title>
          <Paragraph>
            <ul>
              {chunks?.map((chunk, index) => (
                <li key={index}>
                  <Title level={5}>{chunk.id}</Title>
                  <Space size={30}>
                    <Text>序号：{chunk.chunk_order_index + 1}</Text>
                    <Text>token：{chunk.tokens}</Text>
                  </Space>
                  <pre>{chunk.content}</pre>
                </li>
              ))}
            </ul>
          </Paragraph>
        </>
      )}
    </div>
  );
};

export default DocumentDetail;
