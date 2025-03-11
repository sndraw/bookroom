import { addGraphLink } from '@/services/common/ai/graph';
import { OperationTypeEnum } from '@/types';
import { PlusOutlined } from '@ant-design/icons';
import {
  DrawerForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Form } from 'antd';
import React, { useEffect, useState } from 'react';

interface LinkAddProps {
  graph: string;
  workspace: string;
  graphData?: API.AIGraphData;
  refresh?: () => void;
  className?: string;
}

const LinkAdd: React.FC<LinkAddProps> = (props) => {
  const { graph, workspace, graphData, refresh, className } = props;
  const [form] = Form.useForm<API.AIGraphLinkVO>();
  // 操作状态管理
  const { operation, setOperation, resetOperation } = useModel('graphOperation');
  // 状态管理
  const [visible, setVisible] = useState(false);

  const [loading, setLoading] = useState(false);
  const sourceNode = operation?.link?.source;

  // 打开弹窗
  useEffect(() => {
    if (operation?.type !== OperationTypeEnum.addLink) {
      setVisible(false);
      return;
    }
    setVisible(true);
    // run();
  }, [operation]);

  const getDefaultValues = () => {
    return {
      source: sourceNode?.id,
      target: "",
      weight: 1.0,
      keywords: "",
      description: "",
      source_id: sourceNode?.source_id || "UNKNOWN", // 默认值为 UNKNOWN
    };
  };
  const handleAdd = async (values: any) => {
    setLoading(true);
    try {
      await addGraphLink(
        {
          graph: graph,
          workspace: workspace
        },
        {
          source: values?.source,
          target: values?.target,
          weight: values?.weight,
          keywords: values?.keywords,
          description: values?.description,
          source_id: values?.source_id || "UNKNOWN", // 默认值为 UNKNOWN
        },
        {
          timout: 0
        }
      ).then((response) => {
        if (operation && response?.data) {
          operation.link = response?.data || {};
          setOperation(operation);
        }
        refresh?.();
      });
      return true;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 获取目标节点选项
  const getTargetNodes = () => {
    const sourceNodeId = sourceNode?.id;
    if (sourceNodeId) {
      const targetNodes = graphData?.nodes?.filter((node) => {
        // 如果目标节点即当前节点，则不显示该节点
        if (node.id === sourceNodeId) {
          return false;
        }
        const hasLink = graphData?.edges?.some((edge: any) => {
          const edgeSource = edge?.source?.id || edge.source;
          const edgeTarget = edge?.target?.id || edge.target;
          // 如果包含目标节点的节点关系的目标节点是当前节点，则不显示该节点
          if (edgeSource === node.id && edgeTarget === sourceNodeId) {
            return true;
          }
          // 如果包含目标节点的节点关系的源节点是当前节点，则不显示该节点
          if (edgeTarget === node.id && edgeSource === sourceNodeId) {
            return true;
          }
          return false;
        });
        if (hasLink) {
          return false;
        }
        return true;
      });
      return targetNodes?.map((node) => ({ label: node.label, value: node.id }));
    }
    return graphData?.nodes?.map((node) => ({ label: node.label, value: node.id }));
  };

  const isDisabled = loading;



  return (
    <DrawerForm
      title={`添加节点关系`}
      open={visible}
      drawerProps={{ destroyOnClose: true, mask: true }}
      width={"378px"}
      disabled={isDisabled}
      form={form}
      onOpenChange={(open) => {
        if (!open) {
          resetOperation();
          form.resetFields();
        } else {
          form.setFieldsValue(getDefaultValues());
        }
      }}
      onFinish={async (values) => {
        const validate = await form.validateFields();
        if (!validate) {
          return false;
        }
        const isSuccess = await handleAdd(values);
        if (!isSuccess) {
          return false;
        }
        resetOperation(); // 重置操作状态
        refresh?.();
        return true;
      }}
    >
      <ProFormText
        name="source"
        label="源节点"
        rules={[
          {
            required: true,
            message: '请输人源节点',
          },
          {
            min: 1,
            max: 64,
            message: '源节点长度为1到64字符',
          },
        ]}
        placeholder="请输入源节点"
        disabled={sourceNode}
      />
      <ProFormSelect
        name="target"
        label="目标节点"
        options={getTargetNodes() as any}
        showSearch
        rules={[
          {
            required: true,
            message: '请输入目标节点',
          }
        ]}
        placeholder="请输入目标节点"
      />
      <ProFormDigit
        name="weight"
        label="权重"
        fieldProps={{ precision: 1, step: 0.1 }}
        min={0}
        max={100}
        placeholder="请输入权重"
        rules={[
          {
            required: true,
            message: '请输入权重',
          },
        ]}
      />
      <ProFormText
        name="keywords"
        label="关键词"
        rules={[
          {
            required: true,
            message: '请输入关键词',
          },
          {
            min: 2,
            max: 64,
            message: '类型长度为2到64字符',
          },
        ]}
        placeholder="请输入关键词"
      />
      <ProFormTextArea
        name="description"
        label="描述"
        // 显示字符串长度
        fieldProps={{
          showCount: true,
          maxLength: 1024,
        }}
        rules={[
          {
            required: true,
            message: '请输入描述',
          },
          {
            min: 2,
            max: 1024,
            message: '描述长度为2到1024字符',
          },
        ]}
        placeholder="请输入描述"
      />
      <ProFormText
        name="source_id"
        label="来源ID"
        rules={[
          {
            required: true,
            message: '请输入来源ID',
          },
          {
            min: 1,
            max: 64,
            message: '来源ID长度为1到64字符',
          },
        ]}
        placeholder="请输入来源ID"
      />
    </DrawerForm>
  );
};

export default LinkAdd;
