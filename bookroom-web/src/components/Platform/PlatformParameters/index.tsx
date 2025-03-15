import { EditOutlined } from '@ant-design/icons';
import {
  DrawerForm,
  ProFormTextArea,
} from '@ant-design/pro-components';
import { Button, Form, message } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';

interface PlatformParametersProps {
  data: API.PlatformInfo;
  onFinished: (values: any) => Promise<boolean>;
  refresh?: () => void;
  disabled?: boolean;
  className?: string;
}

const PlatformParameters: React.FC<PlatformParametersProps> = (props) => {
  const { data, onFinished, refresh, disabled, className } = props;
  const [form] = Form.useForm<API.PlatformInfo>();

  const [loading, setLoading] = useState(false);

  const handleEdit = async (values: any) => {
    setLoading(true);
    try {
      const fieldValues = { ...values };
      if (values.parameters && typeof values.parameters === "string") {
        fieldValues.parameters = JSON.parse(values.parameters);
      }
      const result = await onFinished(fieldValues);
      return !!result;
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
      title={`修改参数配置`}
      drawerProps={{ destroyOnClose: true, mask: true }}
      width={"378px"}
      form={form}
      trigger={
        <Button
          className={classNames(className)}
          title="修改参数配置"
          icon={<EditOutlined />}
          type="text"
          loading={loading}
          disabled={isDisabled}
        >参数配置</Button>
      }
      onOpenChange={(open) => {
        if (!open) {
          form.resetFields();
        } else {
          const fieldValues = { ...data }
          if (data.parameters && typeof data.parameters === "object") {
            fieldValues.parameters = JSON.stringify(data.parameters);
          }
          form.setFieldsValue(fieldValues);
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
      <ProFormTextArea
        name="parameters"
        label="参数配置"
        minRows={2}
        maxLength={255}
        showCount={true}
        rules={[
          {
            min: 1,
            max: 255,
            message: '参数配置长度为1到255字符',
          }, {
            //  自定义规则
            validator(_: any, value: any) {
              try {
                JSON.parse(value);
                return Promise.resolve();
              } catch (error) {
                return Promise.reject(new Error('参数配置必须是有效的JSON格式'));
              }
            },
          },
        ]}
        placeholder="请输入参数配置"
      />
    </DrawerForm>
  );
};

export default PlatformParameters;
