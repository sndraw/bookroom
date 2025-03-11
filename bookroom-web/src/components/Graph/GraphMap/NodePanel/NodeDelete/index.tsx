import { deleteGraphNode } from '@/services/common/ai/graph';
import { DeleteOutlined } from '@ant-design/icons';
import { Button, Popconfirm } from 'antd';
import React, { useState } from 'react';

interface NodeDeleteProps {
  graph: string;
  workspace: string;
  node: any;
  refresh?: () => void;
  disabled: boolean;
}

const NodeDelete: React.FC<NodeDeleteProps> = (props) => {
  const { graph, workspace, node, refresh, disabled } = props;
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    await deleteGraphNode(
      {
        graph: graph,
        workspace: workspace,
        node_id: node.id,
      },
      {
        timout: 0
      }
    )
      .then((response) => {
        refresh?.();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      {/* 确认删除弹窗 */}
      <Popconfirm
        title="即将删除该节点及其所有子节点和关系，确定要删除吗？"
        disabled={loading || disabled}
        onConfirm={() => {
          handleDelete();
        }}
      >
        <Button
          icon={<DeleteOutlined />}
          title="删除"
          type="text"
          disabled={loading || disabled}
          danger
        ></Button>
      </Popconfirm>
    </>
  );
};

export default NodeDelete;
