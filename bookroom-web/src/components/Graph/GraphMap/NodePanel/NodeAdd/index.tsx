import { addGraphNode } from '@/services/common/ai/graph';
import { OperationTypeEnum } from '@/types';
import { EditOutlined } from '@ant-design/icons';
import {
  DrawerForm,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Button, Form } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';

interface NodeAddProps {
  graph: string;
  workspace: string;
  refresh?: () => void;
  disabled?: boolean;
  className?: string;
}

const NodeAdd: React.FC<NodeAddProps> = (props) => {
  const { graph, workspace, refresh, disabled, className } = props;
  const [form] = Form.useForm<API.AIGraphNodeVO>();
  // 操作状态管理
  const { operation, setOperation, resetOperation } = useModel('graphOperation');
  // 状态管理
  const [visible, setVisible] = useState(false);

  const [loading, setLoading] = useState(false);
  const node = operation?.node;

  // 打开弹窗
  useEffect(() => {
    if (operation?.type !== OperationTypeEnum.addNode) {
      setVisible(false);
      return;
    }
    setVisible(true);
    // run();
  }, [operation]);

  const getDefaultValues = (node: API.AIGraphNodeVO) => {
    return {
      id: node?.id,
      entity_type: node?.entity_type,
      description: node?.description,
      source_id: node?.source_id || "UNKNOWN", // 默认值为 UNKNOWN
    };
  };

  const handleAdd = async (values: any) => {
    setLoading(true);
    try {
      await addGraphNode(
        {
          graph: graph,
          workspace: workspace
        },
        {
          entity_name: values?.id,
          entity_type: values?.entity_type,
          description: values?.description,
          source_id: values?.source_id || "UNKNOWN", // 默认值为 UNKNOWN
        },
        {
          timeout: 0
        }
      ).then((response) => {
        if (operation && response?.data) {
          operation.node = response?.data || {};
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

  const isDisabled = disabled || loading;
  return (
    <DrawerForm
      title={`添加节点`}
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
          form.setFieldsValue(getDefaultValues(node));
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
        resetOperation();
        refresh?.();
        return true;
      }}
    >
      <ProFormText
        name="id"
        label="节点"
        rules={[
          {
            required: true,
            message: '请输入节点',
          },
          {
            min: 1,
            max: 64,
            message: '节点长度为1到64字符',
          },
        ]}
        placeholder="请输入节点"
      />
      <ProFormText
        name="entity_type"
        label="类型"
        rules={[
          {
            required: true,
            message: '请输入类型',
          },
          {
            min: 2,
            max: 64,
            message: '类型长度为2到64字符',
          },
        ]}
        placeholder="请输入类型"
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

export default NodeAdd;
