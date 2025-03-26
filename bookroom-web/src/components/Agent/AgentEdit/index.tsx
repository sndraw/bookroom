import { addAgent, updateAgent } from '@/services/common/agent';
import { EditOutlined } from '@ant-design/icons';
import {
  DrawerForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Button, Form, message } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';

interface AgentEditProps {
  agent: string;
  data: API.AgentInfoVO;
  refresh?: () => void;
  disabled?: boolean;
  className?: string;
}

const AgentEdit: React.FC<AgentEditProps> = (props) => {
  const { agent, data, refresh, disabled, className } = props;
  const [form] = Form.useForm<API.AgentInfoVO>();

  const [loading, setLoading] = useState(false);

  const { getPlatformOptions } = useModel('agentplatformList');

  const handleEdit = async (values: any) => {
    setLoading(true);
    try {
      await updateAgent(
        {
          agent
        },
        {
          name: values?.name,
          platformId: values?.platformId || "",
          description: values?.description,
        }
      ).then((response) => {
        message.success('智能助手修改成功');
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
      title={`修改智能助手`}
      drawerProps={{ destroyOnClose: true, mask: true }}
      width={"378px"}
      form={form}
      trigger={
        <Button
          className={classNames(className)}
          title="修改智能助手"
          icon={<EditOutlined />}
          type="text"
          loading={loading}
          disabled={isDisabled}
        ></Button>
      }
      onOpenChange={(open) => {
        if (!open) {
          form.resetFields();
        } else {
          form.setFieldsValue(data);
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
      <ProFormSelect
        name="platformId"
        label="接口名称"
        rules={[
          {
            required: false,
            message: '请选择接口名称',
          },
        ]}
        placeholder="请选择接口名称"
        options={getPlatformOptions()}
        allowClear
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

export default AgentEdit;
