import { OperationTypeEnum } from '@/types';
import { ProFormInstance } from '@ant-design/pro-components';
import { useAccess, useModel } from '@umijs/max';
import { Drawer, Empty, Flex, Spin } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import { formatText } from '../utils';
import styles from './index.less';
import NodeDelete from './NodeDelete';
import NodeEdit from './NodeEdit';
import LinkAdd from '../LinkPanel/LinkAdd';

// 添加props类型
interface NodePanelProps {
  graph: string;
  graphData: API.AIGraphData;
  workspace: string;
  onClose?: () => void;
  refresh?: () => void;
}

const NodePanel: React.FC<NodePanelProps> = (props) => {
  const { graph, graphData, workspace, onClose, refresh } = props;

  // 状态管理
  const [visible, setVisible] = useState(false);
  // 操作状态管理
  const { operation, resetOperation } = useModel('graphOperation');
  const [loading, setLoading] = useState(false);
  // 权限
  const access = useAccess();
  const canEdit = access.canSeeDev;
  const data = operation?.node;
  // 打开抽屉
  useEffect(() => {
    if (operation?.type !== OperationTypeEnum.edit) {
      setVisible(false);
      return;
    }
    if (!operation?.node?.id) {
      setVisible(false);
      return;
    }
    setVisible(true);
    // run();
  }, [operation]);
  const title = `节点`;
  return (
    <Drawer
      title={title}
      placement="right"
      mask={false}
      onClose={() => {
        setVisible(false);
        resetOperation(); // 重置操作状态
        onClose?.();
      }}
      destroyOnClose={true}
      open={visible}
      footer={
        <>
          {canEdit &&
            <Flex gap={16} wrap align="center" justify="end">
              {/* 编辑 */}
              <NodeEdit
                key={"edit" + operation?.node?.id}
                graph={graph}
                workspace={workspace}
                node={data}
                refresh={() => {
                  setVisible(false);
                  refresh?.();
                }}
                disabled={loading}
              />
              {/* 删除 */}
              <NodeDelete
                key={"delete" + operation?.node?.id}
                graph={graph}
                workspace={workspace}
                node={data}
                refresh={() => {
                  setVisible(false);
                  refresh?.();
                }}
                disabled={loading}
              />
            </Flex>
          }
        </>
      }
    >
      <Spin spinning={loading}>
        {!data && <Empty description="暂无数据" />}
        {data && (
          <div className={styles?.nodeInfo}>
            {/* 节点信息展示 */}
            <p className={styles?.nodeInfoItem}>
              <label className={styles?.nodeLabel}>节点：</label>
              <span>{formatText(operation?.node?.id)}</span>
            </p>
            {/* {data?.label && (
              <p className={styles?.nodeInfoItem}>
                <label className={styles?.nodeLabel}>标签：</label>
                <span>{formatText(data?.label)}</span>
              </p>
            )} */}
            {/* 其他信息展示 */}
            <p className={styles?.nodeInfoItem}>
              <label className={styles?.nodeLabel}>类型：</label>
              <span>{formatText(data?.entity_type || '未知')}</span>
            </p>
            <p className={styles?.nodeInfoItem}>
              <label className={styles?.nodeLabel}>描述：</label>
              <span>{formatText(data?.description || '')}</span>
            </p>
            <p className={styles?.nodeInfoItem}>
              <label className={styles?.nodeLabel}>来源：</label>
              <span>{formatText(data?.source_id || '')}</span>
            </p>
          </div>
        )}
      </Spin>
    </Drawer>
  );
};

export default NodePanel;
