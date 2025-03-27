import { addAgent } from '@/services/common/agent';
import { PlusOutlined } from '@ant-design/icons';
import {
  DrawerForm,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Form, message } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';

interface AgentAddProps {
  refresh?: () => void;
  disabled?: boolean;
  className?: string;
}

const AgentAdd: React.FC<AgentAddProps> = (props) => {
  const { refresh, disabled, className } = props;
  const [form] = Form.useForm<API.AgentInfoVO>();

  const [loading, setLoading] = useState(false);

  const handleAdd = async (values: any) => {
    setLoading(true);
    try {
      await addAgent(
        {
          name: values?.name,
          description: values?.description,
        }
      ).then((response) => {
        message.success('智能助手添加成功');
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
      title={`添加智能助手`}
      drawerProps={{ destroyOnClose: true, mask: true }}
      width={"378px"}
      form={form}
      trigger={
        <Button
          className={classNames(className)}
          title="添加智能助手"
          icon={<PlusOutlined />}
          type="primary"
          shape="circle"
          loading={loading}
          disabled={isDisabled}
        ></Button>
      }
      onOpenChange={(open) => {
        if (!open) {
          form.resetFields();
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
        refresh?.();
        return true;
      }}
    >
      <ProFormText
        name="name"
        label="名称"
        rules={[
          {
            required: true,
            message: '请输入名称',
          },
          {
            min: 1,
            max: 64,
            message: '名称长度为1到64字符',
          },
        ]}
        placeholder="请输入名称"
      />
      <ProFormTextArea
        name="description"
        label="描述"
        minRows={2}
        maxLength={255}
        showCount={true}
        rules={[
          {
            min: 1,
            max: 255,
            message: '描述长度为1到255字符',
          },
        ]}
        placeholder="请输入描述"
      />
    </DrawerForm>
  );
};

export default AgentAdd;
