import { clearGraphData } from '@/services/common/ai/graph';
import { ClearOutlined } from '@ant-design/icons';
import { Button, Popconfirm } from 'antd';
import React from 'react';

interface DocumentsClearProps {
  graph: string;
  workspace?: string;
  refresh?: () => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const DocumentsClear: React.FC<DocumentsClearProps> = (props) => {
  const { graph, workspace = '', refresh, loading, setLoading } = props;

  const handleClear = async () => {
    setLoading(true);
    await clearGraphData({
      graph,
      workspace,
    })
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
        title="确定要清空所有文档吗？"
        disabled={loading}
        onConfirm={() => {
          handleClear();
        }}
      >
        <Button
          icon={<ClearOutlined />}
          title="清空文档"
          type="default"
          disabled={loading}
          danger
        ></Button>
      </Popconfirm>
    </>
  );
};

export default DocumentsClear;
