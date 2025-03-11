import { updateGraphNode } from '@/services/common/ai/graph';
import { EditOutlined } from '@ant-design/icons';
import {
  ModalForm,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Button, Form } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';

interface NodeEditProps {
  graph: string;
  workspace: string;
  node: any;
  refresh?: () => void;
  disabled: boolean;
  className?: string;
}

const NodeEdit: React.FC<NodeEditProps> = (props) => {
  const { graph, workspace, node, refresh, disabled, className } = props;
  const [form] = Form.useForm<API.AIGraphNodeVO>();
  // 操作状态管理
  const { operation, setOperation } = useModel('graphOperation');

  const [loading, setLoading] = useState(false);

  const getDefaultValues = (node: API.AIGraphNodeVO) => {
    return {
      id: node?.id,
      entity_type: node?.entity_type,
      description: node?.description,
      source_id: node?.source_id || "UNKNOWN", // 默认值为 UNKNOWN
    };
  };

  const handleEdit = async (values: any) => {
    setLoading(true);
    try {
      await updateGraphNode(
        {
          graph: graph,
          workspace: workspace,
          node_id: node.id,
        },
        {
          entity_name: node?.id,
          entity_type: values?.entity_type,
          description: values?.description,
          source_id: values?.source_id || "UNKNOWN",
        },
        {
          timout: 0
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
    <ModalForm
      title={`编辑节点`}
      trigger={
        <Button
          key={node?.id || 'edit'}
          className={classNames(className)}
          title="编辑节点"
          icon={<EditOutlined />}
          type="text"
          loading={loading}
          disabled={isDisabled}
        ></Button>
      }
      modalProps={{ destroyOnClose: true }}
      disabled={isDisabled}
      form={form}
      onOpenChange={(open) => {
        if (!open) {
          // form.resetFields();
        } else {
          form.setFieldsValue(getDefaultValues(node));
        }
      }}
      onFinish={async (values) => {
        const validate = await form.validateFields();
        if (!validate) {
          return false;
        }
        const isSuccess = await handleEdit(values);
        if (!isSuccess) {
          return false;
        }
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
        disabled
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
    </ModalForm>
  );
};

export default NodeEdit;
