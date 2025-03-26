import useHeaderHeight from '@/hooks/useHeaderHeight';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { Button, Divider, FloatButton, Input, Space, Tag, Typography } from 'antd';
import classNames from 'classnames';
import { Key, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import LinkDelete from '../GraphMap/LinkPanel/LinkDelete';
import LinkEdit from '../GraphMap/LinkPanel/LinkEdit';
import NodeDelete from '../GraphMap/NodePanel/NodeDelete';
import NodeEdit from '../GraphMap/NodePanel/NodeEdit';
import { formatText } from '../GraphMap/utils';
import styles from './index.less';
import { Access, useAccess, useModel } from '@umijs/max';
import { OperationTypeEnum } from '@/types';
import LinkAdd from '../GraphMap/LinkPanel/LinkAdd';
import NodeAdd from '../GraphMap/NodePanel/NodeAdd';

type GraphTablePropsType = {
  title?: string;
  // 当前graph
  graph: string;
  // 当前workspace
  workspace: string;
  // 图谱数据
  graphData?: API.AIGraphData;
  // loading状态
  loading: boolean;
  // 刷新
  refresh: () => void;
  className?: string;
};
const GraphTable: React.FC<GraphTablePropsType> = (props) => {
  const {
    title,
    graph,
    workspace,
    graphData,
    loading,
    refresh,
    className,
  } = props;
  // 展开row的key数组
  const [expandedKeys, setExpandedKeys] = useState<readonly Key[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  const [searchText, setSearchText] = useState<string>('' as string);
  // 操作状态管理
  const { operation, setOperation, resetOperation } = useModel('graphOperation');
  const { getGraphName } = useModel('graphList');

  const listRef = useRef<any>(null);
  const headerHeight = useHeaderHeight();

  const access = useAccess();
  const canEdit = access.canSeeDev;

  useEffect(() => {
    return () => {
      // 重置操作状态，防止操作状态影响下一次渲染
      resetOperation();
    };
  }, []);

  //  渲染关联节点的渲染函数
  const edgesRender = (edges: any[]) => {
    if (!edges || edges.length === 0) {
      return null;
    }
    return (
      <Space direction="vertical" wrap >
        {
          edges.map((edge: any, index: number) => (
            <Space key={index} direction="horizontal" wrap className={styles.edgeInfoItem}>
              <span>
                <label>关联节点：</label>
                <Tag
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setSearchText(formatText(edge?.target));
                  }}
                  color="processing"
                >
                  {formatText(edge?.target)}
                </Tag>
              </span>
              {
                canEdit &&
                <>
                  <LinkEdit
                    graph={graph}
                    workspace={workspace}
                    link={edge}
                    refresh={() => {
                      // setVisible(false);
                      refresh?.();
                    }}
                    disabled={loading}
                  />
                  <LinkDelete
                    graph={graph}
                    workspace={workspace}
                    link={edge}
                    refresh={() => {
                      // setVisible(false);
                      refresh?.();
                    }}
                    disabled={loading}
                  />
                </>
              }
            </Space>
          ))
        }
      </Space>
    );
  };


  const columns: ProColumns<any>[] = [
    {
      title: '序号',
      dataIndex: 'num',
      key: 'num',
      hideInForm: true,
      editable: false,
      hideInSearch:true,
    },
    {
      title: '节点',
      dataIndex: 'id',
      key: 'id',
      render: (text, row) => {
        return <span>{formatText(row.id)}</span>
      },
    },
    {
      title: "类型",
      dataIndex: "entity_type",
      key: "entity_type",
      render: (text, row) => {
        return <Tag>{formatText(row?.entity_type || '未知')}</Tag>
      }
    },
    {
      title: '关联节点',
      dataIndex: 'edges',
      key: 'edges',
      render: (text, row) => {
        const buttonRender = () => {
          if (!canEdit) {
            return null;
          }
          return <Button
            type="link"
            title="添加关联节点"
            icon={<PlusOutlined />}
            onClick={() => {
              setOperation({
                type: OperationTypeEnum.addLink,
                link: {
                  source: row
                }
              })
            }}>
          </Button>
        }
        if (!row?.edges) {
          return <>{buttonRender()}</>;
        }
        return (
          <>
            {buttonRender()}
            {edgesRender(row.edges)}
          </>
        );
      }
    },
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
              <NodeEdit
                graph={graph}
                workspace={workspace}
                node={row}
                refresh={() => {
                  // setVisible(false);
                  refresh?.();
                }}
                disabled={loading}
              />
              <NodeDelete
                graph={graph}
                workspace={workspace}
                node={row}
                refresh={() => {
                  refresh?.();
                }}
                disabled={loading}
              />
            </div>
          );
        },
      },
    )

  }
  // 计算样式
  const containerStyle = useCallback(() => {
    return {
      height: `calc(100vh - ${headerHeight + 40}px)`,
    };
  }, [headerHeight]);


  const filterNodes = useMemo((): any[] => {
    const { nodes, edges } = graphData || {};
    if (!nodes) return [];
    let fliterNodes: any[] = [...nodes];
    if (searchText) {
      fliterNodes = nodes.filter((item: any) =>
        item?.label?.toLowerCase()?.includes(searchText?.toLowerCase()),
      );
    };

    const newNodes = fliterNodes.map((node: any, index: number) => {
      const filterEdges = edges?.filter((edge: any) => {
        return edge?.source === node.id;
      });
      return {
        ...node,
        num: (index + 1).toString().padStart(2, '0'),
        edges: filterEdges
      };
    });

    return newNodes;
  }, [graphData, searchText]);


  // 请求加载状态
  return (
    <div
      ref={containerRef}
      className={classNames(styles.container, className)}
      style={containerStyle()}
    >
      <Space size={0} wrap className={styles.header}>
        <Space size={0} wrap className={styles.documentTags}>
          <span>{getGraphName(graph)}</span>
        </Space>
        <Divider type="vertical" />
        <Space size={0} wrap className={styles.documentTitle}>
          <span>{workspace}</span>
        </Space>
        <Divider type="vertical" />
        {/* 筛选节点 */}
        <Input.Search
          allowClear
          placeholder={'搜索节点'}
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
          }}
        />
        <FloatButton.Group>
          <Access accessible={canEdit}>
            {/* 添加节点 */}
            <FloatButton
              className={styles.refreshButton}
              tooltip="添加节点"
              icon={<PlusOutlined />}
              key="addNode"
              type="primary"
              onClick={() => {
                setOperation({
                  type: OperationTypeEnum.addNode,
                  node: null,
                });
              }}
            ></FloatButton>
          </Access>
          {/* 刷新 */}
          <FloatButton
            className={styles.refreshButton}
            tooltip="刷新"
            icon={<ReloadOutlined />}
            key="refresh"
            onClick={() => {
              refresh?.();
            }}
          ></FloatButton>
        </FloatButton.Group>
      </Space>

      <ProTable<any>
        actionRef={listRef}
        className={styles.tableWrapper}
        loading={loading}
        rowKey={'id'}
        dataSource={filterNodes}
        rowClassName={styles.rowItem}
        search={false}
        options={false}
        showHeader={false}
        // virtual={true}
        // scroll={{ y: 300, x: "100%", scrollToFirstRowOnChange: false }}
        expandable={{
          columnWidth: 30,
          expandedRowKeys: expandedKeys,
          onExpandedRowsChange: setExpandedKeys,
          expandedRowRender: (row) => {
            return (
              <Typography
                className={styles.expandedRow}
              >
                {/* 其他信息展示 */}
                <div className={styles?.nodeInfoItem}>
                  <label className={styles?.nodeLabel}>描述：</label>
                  <span className={styles?.nodeDescription}>{formatText(row?.description || '')}</span>
                </div>
                <div className={styles?.nodeInfoItem}>
                  <label className={styles?.nodeLabel}>来源：</label>
                  <span className={styles?.nodeDescription}>{formatText(row?.source_id || 'UNKNOWN')}</span>
                </div>
              </Typography>
            );
          },
          rowExpandable: (record) => record.label,
        }}
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
          total: filterNodes?.length,
        }}
      />
      <Access accessible={canEdit}>
        {/* 添加节点关系 */}
        <LinkAdd graph={graph} graphData={graphData} workspace={workspace} refresh={refresh} />
        {/* 添加节点 */}
        <NodeAdd graph={graph} workspace={workspace} refresh={refresh} />
      </Access>
    </div>
  );
};

export default GraphTable;
