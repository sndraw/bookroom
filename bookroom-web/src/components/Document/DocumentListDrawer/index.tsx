import ROUTE_MAP from '@/routers/routeMap';
import {
  deleteGraphDocument,
  queryGraphDocumentList,
} from '@/services/common/ai/document';
import {
  BookTwoTone,
  DeleteOutlined,
  EyeOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { ProList } from '@ant-design/pro-components';
import { Link } from '@umijs/max';
import { Button, Drawer, Flex, Popconfirm, Tag, Typography } from 'antd';
import React, { Key, useEffect, useState } from 'react';
import DocStatusTag from '../DocStatusTag';
import DocumentInput from '../DocumentInput';
import DocumentUpload from '../DocumentUpload';
import DocumentsClear from '../DocumentsClear';
import { DocStatus } from '../enum';
const { Title, Paragraph, Text } = Typography;

// 添加props类型
interface DocumentListProps {
  graph: string;
  workspace?: string;
  refresh?: () => void;
}

const DocumentListDrawer: React.FC<DocumentListProps> = (props) => {
  const { graph, workspace, refresh } = props;
  // 状态管理
  const [drawerVisible, setDrawerVisible] = useState(false);
  // 文档列表
  const [documents, setDocuments] = useState<any>([]);
  // 展开具体文档的key数组
  const [documentExpandedKeys, setDocumentExpandedKeys] = useState<
    readonly Key[]
  >([]);
  // 请求加载状态
  const [reqLoading, setReqLoading] = useState(false);

  const handleQueryList = async () => {
    setReqLoading(true);
    await queryGraphDocumentList({
      graph: graph || '',
      workspace: encodeURIComponent(workspace || ''),
    })
      .then((response) => {
        setDocuments(response.data);
      })
      .finally(() => {
        setReqLoading(false);
      });
  };
  const handleDelete = async (document_id: string) => {
    setReqLoading(true);
    await deleteGraphDocument({
      graph: graph,
      workspace: encodeURIComponent(workspace || ''),
      document_id: document_id,
    })
      .then((response) => {
        handleQueryList();
        refresh?.();
      })
      .finally(() => {
        setReqLoading(false);
      });
  };

  // 文档数据处理
  const reDocumentList = () => {
    // 如果是对象，转换为数组
    if (typeof documents === 'object') {
      // 对象的key当作id
      return Object.keys(documents).map((key) => {
        // 对象的key当作id
        const doc = documents[key];
        if (typeof doc === 'object' && doc !== null) {
          return {
            id: key,
            ...doc,
          };
        }
        return { id: key }; // 或者根据实际情况返回默认值
      });
    } else if (Array.isArray(documents)) {
      return documents;
    }
    return [];
  };

  useEffect(() => {
    if (graph && drawerVisible) {
      handleQueryList();
    }
  }, [graph, drawerVisible]);

  return (
    <>
      {/* 文档列表 */}
      <Button
        title="文档列表"
        type="text"
        icon={<BookTwoTone />}
        size="large"
        onClick={() => {
          // 右侧弹出文档列表抽屉
          setDrawerVisible(true);
        }}
      ></Button>
      <Drawer
        title={`文档列表 (${reDocumentList()?.length})`}
        placement="right"
        mask={true}
        onClose={() => {
          setDrawerVisible(false);
        }}
        open={drawerVisible}
        footer={
          <Flex gap={16} wrap align="center" justify="end">
            {/* 刷新 */}
            <Button
              title="刷新"
              type="text"
              icon={<ReloadOutlined />}
              onClick={() => {
                handleQueryList();
                refresh?.();
              }}
            />
            {/* 插入文本 */}
            <DocumentInput
              graph={graph}
              workspace={workspace}
              disabled={reqLoading}
              refresh={() => {
                handleQueryList();
                refresh?.();
              }}
            />
            {/* 上传文件 */}
            <DocumentUpload
              graph={graph}
              workspace={workspace}
              disabled={reqLoading}
              refresh={() => {
                handleQueryList();
                refresh?.();
              }}
              style={{ flex: 0 }}
            />
            {/* 清空文档 */}
            <DocumentsClear
              graph={graph}
              workspace={workspace}
              refresh={() => {
                handleQueryList();
                refresh?.();
              }}
              loading={reqLoading}
              setLoading={setReqLoading}
            />
          </Flex>
        }
      >
        <ProList<any>
          loading={reqLoading}
          rowKey="id"
          dataSource={reDocumentList()}
          expandable={{
            expandedRowKeys: documentExpandedKeys,
            onExpandedRowsChange: setDocumentExpandedKeys,
          }}
          metas={{
            title: {
              dataIndex: 'content_summary',
              render: (text, row) => {
                return (
                  <Paragraph
                    ellipsis={{
                      rows: 2,
                      expandable: false,
                    }}
                  >
                    <DocStatusTag status={row.status as DocStatus} />
                    {text}
                  </Paragraph>
                );
              },
            },
            // subTitle: {
            //   dataIndex: 'status',
            //   render: (text) => {
            //     return <StatusTag status={text as DocStatus} />;
            //   },
            // },
            description: {
              dataIndex: 'content_summary',
              render: (text, row) => {
                return (
                  <Typography>
                    {row?.error && <Tag color="error">{row.error}</Tag>}
                    <Paragraph>
                      <Text strong>更新时间：</Text>
                      {new Date(row.updated_at).toLocaleString()}
                    </Paragraph>
                    <Paragraph>
                      <Text strong>摘要：</Text>
                      {text}
                    </Paragraph>
                  </Typography>
                );
              },
            },
            actions: {
              render: (_, row) => [
                <Link
                  key={row.id + 'detail'}
                  title="详情"
                  to={{
                    pathname: ROUTE_MAP.AI_DOCUMENT_DETAIL,
                    search: new URLSearchParams({
                      graph: graph || '',
                      workspace: workspace || '',
                      document_id: row.id,
                    }).toString(),
                  }}
                  target="_blank"
                >
                  <EyeOutlined />
                </Link>,
                // 删除确认弹窗
                <Popconfirm
                  key={row.id + 'delete'}
                  title="确定要删除该文档吗？"
                  onConfirm={() => {
                    handleDelete(row.id);
                  }}
                >
                  <Button type="link" danger icon={<DeleteOutlined />} />
                </Popconfirm>,
              ],
            },
          }}
        />
      </Drawer>
    </>
  );
};

export default DocumentListDrawer;
