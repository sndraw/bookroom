import { AI_LM_TYPE_MAP } from '@/common/ai';
import { PlusOutlined } from '@ant-design/icons';
import {
  DrawerForm,
  ModalForm,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Form, message } from 'antd';
import React, { PropsWithChildren, useState } from 'react';

interface LmAddProps {
  platform: string;
  addItem?: (params: any, fields: any) => Promise<any>;
  refresh: () => void;
}

const LmAdd: React.FC<PropsWithChildren<LmAddProps>> = (props) => {
  const [loading, setLoading] = useState<string | boolean | number>(false);
  const { platform, refresh, addItem } = props;
  const [form] = Form.useForm<API.AILmInfoVO>();
  /**
   * 添加节点
   * @param fields
   */
  const handleAdd = async (fields: API.AILmInfoVO) => {
    if (!platform) return false;
    setLoading(true);
    try {
      await addItem?.(
        { platform: platform },
        {
          ...fields,
          model: encodeURIComponent(fields?.model.trim()),
        },
      ).then(async (res) => {
        message.success('模型添加成功');
        refresh(); // 刷新列表
      });
      return true;
    } catch (error: any) {
      const errorData = error;
      console.error(`模型添加失败：${errorData?.message}`);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 模型类型选择器
  const modelTypeOptions: any = () => {
    return Object.values(AI_LM_TYPE_MAP).map((item) => ({
      label: item?.text,
      value: item?.value,
    }));
  };

  return (
    <DrawerForm
      title="添加模型"
      width={"378px"}
      trigger={
        <Button
          title="添加模型"
          icon={<PlusOutlined />}
          type="primary"
          shape="circle"
          loading={!!loading}
          disabled={!!loading}
        ></Button>
      }
      form={form}
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
        const result = await handleAdd(values as any);
        if (!result) {
          return false;
        }
        return true;
      }}
    >
      {/* <ProFormText
        name="platform"
        label="平台名称"
        disabled
        initialValue={platform}
        rules={[
          {
            required: true,
            message: '平台名称为必填项',
          },
          {
            pattern: PLATFORM_RULE.name.RegExp,
            message: PLATFORM_RULE.name.message,
          },
        ]}
        placeholder="请输入模型标识"
      /> */}
      <ProFormText
        name="model"
        label="模型标识"
        rules={[
          {
            required: true,
            message: '请输入模型标识',
          },
          {
            min: 2,
            max: 255,
            message: '模型标识长度为2-255个字符',
          },
        ]}
        placeholder="请输入模型标识"
      />
      {/* 模型类型 */}
      <ProFormSelect
        name="type"
        label="模型类型"
        rules={[
          {
            required: true,
            message: '请选择模型类型',
          },
        ]}
        initialValue={AI_LM_TYPE_MAP?.llm.value}
        placeholder="请选择模型类型"
        options={modelTypeOptions()}
      />
      <ProFormText
        name="name"
        label="模型名称"
        rules={[
          {
            required: false,
            message: '请输入模型名称',
          },
          {
            min: 2,
            max: 255,
            message: '模型名称长度为2-255个字符',
          },
        ]}
        placeholder="请输入模型名称"
      />
      {/* 模型大小 */}
      <ProFormDigit
        name="size"
        label="模型大小"
        initialValue={0}
        addonAfter={'MB'}
        rules={[
          {
            required: false,
            message: '请输入模型大小',
          },
        ]}
        placeholder="请输入模型大小"
      />
    </DrawerForm>
  );
};

export default LmAdd;
