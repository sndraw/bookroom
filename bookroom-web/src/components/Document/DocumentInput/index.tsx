import { insertDocumentText } from '@/services/common/ai/document';
import { FileAddOutlined } from '@ant-design/icons';
import { ModalForm, ProFormTextArea } from '@ant-design/pro-components';
import { Button, Form, message } from 'antd';
import classNames from 'classnames';
import React from 'react';

// 添加props类型
interface DocumentInputProps {
  graph: string;
  workspace?: string;
  refresh?: () => void;
  disabled: boolean;
  className?: string;
}

const DocumentInput: React.FC<DocumentInputProps> = (props) => {
  const { graph, workspace = '', refresh, disabled, className } = props;
  const [loading, setLoading] = React.useState<boolean>(false);

  const [form] = Form.useForm<API.AIGraphDocument_TextType>();

  const handleInput = async (values: API.AIGraphDocument_TextType) => {
    setLoading(true);
    try {
      await insertDocumentText(
        {
          graph,
          workspace,
        },
        {
          ...values,
        },
        { skipErrorHandler: true, timeout: 30000 },
      );
      // message.success('插入文本成功');
      return true;
    } catch (error: any) {
      const errorData = error?.data || error;
      message.error(errorData?.message || '插入文本失败');
      return false;
    } finally {
      refresh?.();
      setLoading(false);
    }
  };

  const isDisabled = disabled || loading;

  return (
    <ModalForm
      title="插入文本"
      trigger={
        <Button
          className={classNames(className)}
          title="插入文本"
          icon={<FileAddOutlined />}
          type="dashed"
          loading={loading}
          disabled={isDisabled}
        ></Button>
      }
      disabled={isDisabled}
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
        await handleInput(values);
        return true;
      }}
    >
      <ProFormTextArea
        name="text"
        label="文本"
        // 显示字符串长度
        fieldProps={{
          showCount: true,
          maxLength: 1024,
        }}
        rules={[
          {
            required: true,
            message: '请输入文本',
          },
          {
            min: 2,
            max: 1024,
            message: '文本长度为2到1024字符',
          },
        ]}
        placeholder="请输入文本"
      />
      {/* <ProForm.Group>
        <ProFormSwitch
          name="split_by_character_only"
          label="仅分割字符"
          tooltip="选中后，将仅使用分割字符进行分割，否则将使用默认分割方式"
          initialValue={false}
          valuePropName="checked"
          required
        />
        <Form.Item
          shouldUpdate={(prevValues, curValues) =>
            prevValues.split_by_character_only !==
            curValues.split_by_character_only
          }
        >
          {({ getFieldValue }) => {
            const splitByCharacterOnly = getFieldValue(
              'split_by_character_only',
            );
            return (
              <ProFormText
                name="split_by_character"
                label="分割字符"
                initialValue=""
                // 显示字符串长度
                fieldProps={{
                  showCount: true,
                  maxLength: 24,
                }}
                rules={[
                  {
                    required: splitByCharacterOnly,
                    message: '请输入分割字符',
                  },
                  {
                    min: 1,
                    max: 10,
                    message: '分割字符长度为1-10个字符',
                  },
                ]}
                placeholder="请输入分割字符"
              />
            );
          }}
        </Form.Item>
      </ProForm.Group> */}
    </ModalForm>
  );
};

export default DocumentInput;
