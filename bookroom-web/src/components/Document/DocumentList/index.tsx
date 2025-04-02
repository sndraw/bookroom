import ROUTE_MAP from '@/routers/routeMap';
import { deleteGraphDocument } from '@/services/common/ai/document';
import { DeleteOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { generatePath, Link, useAccess, useModel } from '@umijs/max';
import { Button, Divider, FloatButton, Input, Popconfirm, Space, Tag, Typography } from 'antd';
import classNames from 'classnames';
import React, { Key, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DocStatusTag from '../DocStatusTag';
import DocumentInput from '../DocumentInput';
import DocumentUpload from '../DocumentUpload';
import DocumentsClear from '../DocumentsClear';
import { DocStatus } from '../enum';
import styles from './index.less';
import useHeaderHeight from '@/hooks/useHeaderHeight';

// 添加props类型
interface DocumentListProps {
  graph: string;
  dataList: API.AIGraphDocumentInfo[];
  workspace?: string;
  loading?: boolean;
  refresh?: () => void;
  className?: string;
}

const DocumentList: React.FC<DocumentListProps> = (props) => {
  const { graph, workspace, dataList, loading = false, refresh, className } = props;
  const { getGraphName } = useModel('graphList');

  const [searchText, setSearchText] = useState<string>('' as string);
  const timeoutObj = useRef<NodeJS.Timeout | null>(null);

  // 展开row的key数组
  const [expandedKeys, setExpandedKeys] = useState<readonly Key[]>([]);
  // 请求加载状态
  const [reqLoading, setReqLoading] = useState(false);
  const headerHeight = useHeaderHeight();
  const access = useAccess();
  const canEdit = access.canSeeDev;

  const handleDelete = async (document_id: string) => {
    setReqLoading(true);
    await deleteGraphDocument({
      graph: graph,
      workspace: workspace || '',
      document_id: document_id,
    })
      .then((response) => {
        refresh?.();
      })
      .finally(() => {
        setReqLoading(false);
      });
  };
  // 计算样式
  const containerStyle = useCallback(() => {
    return {
      height: `calc(100vh - ${headerHeight + 40}px)`,
    };
  }, [headerHeight]);
  // 文档数据处理
  const reDocumentList = (documents: any) => {
    // 如果是对象，转换为数组
    if (typeof documents === 'object') {
      // 对象的key当作id
      return Object.keys(documents).map((key, index) => {
        // 对象的key当作id
        const doc = documents[key];
        if (typeof doc === 'object' && doc !== null) {
          return {
            id: key,
            num: (index + 1).toString().padStart(2, '0'),
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

  const filterData = useMemo(() => {
    const documents = reDocumentList(dataList);
    if (!searchText) return documents;
    return documents?.filter(
      (item: any) =>
        item?.content_summar?.toLowerCase()?.includes(searchText?.toLowerCase()) ||
        item?.content?.toLowerCase()?.includes(searchText?.toLowerCase()),
    );
  }, [dataList, searchText]);

  const columns: ProColumns<any>[] = [
    {
      title: '序号',
      dataIndex: 'num',
      width: 50,
      key: 'num',
      hideInForm: true,
      editable: false,
      hideInSearch: true,
    },
    {
      title: '摘要',
      dataIndex: 'content_summary',
      key: 'content_summary',
      render: (text) => {
        return (
          <Typography.Paragraph
            ellipsis={{
              rows: 2,
              expandable: 'collapsible',
            }}
            copyable
          >{text}</Typography.Paragraph>
        )
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text, row) => {
        return <span style={{ cursor: 'default' }} title={row?.error || text}><DocStatusTag status={text as DocStatus} /></span>;
      },
    },
    {
      title: '长度',
      dataIndex: 'content_length',
      key: 'content_length',
      width: 50,
      render: (text) => {
        return <span>{text}</span>
      },
    },
    {
      title: '分块',
      dataIndex: 'chunks_count',
      key: 'chunks_count',
      width: 50,
      render: (text) => {
        return <span>{text}</span>
      },
    },
    {
      title: '源文件',
      dataIndex: 'file_path',
      width: 200,
      key: 'file_path',
      render: (text) => {
        return <span>{text}</span>
      },
    },
    {
      title: '创建时间',
      dataIndex: 'status',
      width: 150,
      key: 'created_at',
      render: (text, row) => {
        return <span>{new Date(row.created_at).toLocaleString()}</span>;
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      width: 150,
      key: 'updated_at',
      render: (text, row) => {
        return <span>{new Date(row.updated_at).toLocaleString()}</span>;
      },
    }
  ];
  if (canEdit) {
    columns.push(
      {
        title: '操作',
        key: 'action',
        width: 100,
        render: (text, row) => {
          return (
            <div>
              <Link
                key={row.id + 'detail'}
                title="详情"
                to={{
                  pathname: generatePath(ROUTE_MAP.AI_DOCUMENT_DETAIL, {
                    graph: graph || '',
                    workspace: encodeURIComponent(workspace?.trim() || ''),
                    document_id: row.id,
                  }),
                }}
              // target="_blank"
              >
                <EyeOutlined />
              </Link>
              <Popconfirm
                key={row.id + 'delete'}
                title="确定要删除该文档吗？"
                onConfirm={() => {
                  handleDelete(row.id);
                }}
              >
                <Button type="link" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            </div>
          );
        },
      }
    )
  }

  useEffect(() => {
    const documents = reDocumentList(dataList);
    if (documents?.length > 0) {
      const processingData = documents?.find((item: { status: DocStatus; }) => {
        return item?.status === DocStatus?.PENDING || item?.status === DocStatus.PROCESSING;
      })
      // 如果存在待处理或正在处理的数据，则定时刷新
      if (processingData) {
        if (timeoutObj.current) {
          clearTimeout(timeoutObj.current);
          timeoutObj.current = null;
        }
        timeoutObj.current = setTimeout(() => {
          refresh?.();
          timeoutObj.current = null;
        }, 10000)
      }
    }
    return () => {
      if (timeoutObj.current) {
        clearTimeout(timeoutObj.current);
        timeoutObj.current = null;
      }
    }
  }, [dataList]);

  const isLoading = reqLoading || loading;

  return (
    <div className={classNames(styles.container, className)} style={containerStyle()}
    >
      <Space size={0} wrap className={styles.header}>
        <Space size={0} wrap className={styles.headerTitle}>
          <span>{getGraphName(graph)}</span>
        </Space>
        <Divider type="vertical" />
        <Space size={0} wrap className={styles.documentTitle}>
          <span>{workspace}</span>
        </Space>
        <Divider type="vertical" />
        {/* 筛选模型 */}
        <Input.Search
          allowClear
          placeholder={'搜索文档'}
          defaultValue={searchText}
          onSearch={(value) => {
            setSearchText(value);
          }}
        />
        <Divider type="vertical" />
        <Space size={16} wrap >
          <DocumentInput
            graph={graph}
            workspace={workspace}
            disabled={isLoading}
            refresh={() => {
              refresh?.();
            }}
          />
          <DocumentUpload
            graph={graph}
            workspace={workspace}
            disabled={isLoading}
            refresh={() => {
              refresh?.();
            }}
            style={{ flex: 0 }}
          />
          {canEdit &&
            <DocumentsClear
              graph={graph}
              workspace={workspace}
              refresh={() => {
                refresh?.();
              }}
              loading={isLoading}
              setLoading={setReqLoading}
            />
          }
        </Space>
        <FloatButton
          tooltip="刷新"
          className={styles.refreshButton}
          icon={<ReloadOutlined />}
          key="refresh"
          onClick={() => {
            refresh?.();
          }}
        ></FloatButton>
      </Space>
      <ProTable<any>
        className={styles.tableWrapper}
        loading={isLoading}
        rowKey="id"
        dataSource={filterData}
        rowClassName={styles.rowItem}
        search={false}
        options={false}
        columns={columns}
        pagination={{
          style: {
            position: 'fixed',
            bottom: '10px',
            right: '30px',
          },
          size: 'small',
          pageSize: 10,
          showSizeChanger: true,
          total: filterData?.length,
        }}
      />
    </div >
  );
};

export default DocumentList;
