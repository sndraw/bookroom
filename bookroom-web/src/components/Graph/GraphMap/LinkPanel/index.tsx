import { OperationTypeEnum } from '@/types';
import { useAccess, useModel } from '@umijs/max';
import { Drawer, Empty, Flex, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import { formatText } from '../utils';
import styles from './index.less';
import LinkDelete from './LinkDelete';
import LinkEdit from './LinkEdit';
import { AI_GRAPH_PLATFORM_MAP } from '@/common/ai';

// 添加props类型
interface LinkPanelProps {
  graph: string;
  workspace: string;
  onClose?: () => void;
  refresh?: () => void;
}

const LinkPanel: React.FC<LinkPanelProps> = (props) => {
  const { graph, workspace, onClose, refresh } = props;
  // 状态管理
  const [visible, setVisible] = useState(false);
  // 操作状态管理
  const { operation, resetOperation } = useModel('graphOperation');
  const access = useAccess();
  const canEdit = access.canSeeDev;
  const [loading, setLoading] = useState(false);
  const data = operation?.link;
  // 打开抽屉
  useEffect(() => {
    if (operation?.type !== OperationTypeEnum.edit) {
      setVisible(false);
      return;
    }
    if (!operation?.link?.id) {
      setVisible(false);
      return;
    }
    setVisible(true);
    // run();
  }, [operation]);
  const title = `节点关系`;
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
      open={visible}
      destroyOnClose={true}
      footer={
        <>
          {canEdit && <Flex gap={16} wrap align="center" justify="end">
            {/* 编辑 */}
            <LinkEdit
              key={"edit" + operation?.link?.id}
              graph={graph}
              workspace={workspace}
              link={data}
              refresh={() => {
                setVisible(false);
                refresh?.();
              }}
              disabled={loading}
            />
            {/* 删除 */}
            <LinkDelete
              key={"delete" + operation?.link?.id}
              graph={graph}
              workspace={workspace}
              link={data}
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
          <div className={styles?.linkInfo}>
            {/* 节点信息展示 */}
            {/* <p className={styles?.linkInfoItem}>
              <label className={styles?.linkLabel}>ID：</label>
              <span>
                {formatText(data?.id)}
              </span>
            </p> */}
            {/* 节点信息展示 */}
            <p className={styles?.linkInfoItem}>
              <label className={styles?.linkLabel}>源节点：</label>
              <span>{formatText(data?.source.label)}</span>
            </p>
            <p className={styles?.linkInfoItem}>
              <label className={styles?.linkLabel}>目标节点：</label>
              <span>{formatText(data?.target?.label || '未知')}</span>
            </p>
            {/* weight */}
            <p className={styles?.linkInfoItem}>
              <label className={styles?.linkLabel}>权重：</label>
              <span>{(data?.weight || 0).toFixed(1)}</span>
            </p>
            {/* 关系 */}
            <p className={styles?.linkInfoItem}>
              <label className={styles?.linkLabel}>关键词：</label>
              <span>{formatText(data?.keywords || '-')}</span>
            </p>
            <p className={styles?.linkInfoItem}>
              <label className={styles?.linkLabel}>描述：</label>
              <span>{formatText(data?.description || '')}</span>
            </p>
            <p className={styles?.linkInfoItem}>
              <label className={styles?.linkLabel}>来源：</label>
              <span>{data?.source_id || 'UNKNOWN'}</span>
            </p>
          </div>
        )}
      </Spin>
    </Drawer>
  );
};

export default LinkPanel;
