import {
  AI_GRAPH_UPLOAD_FILE_SIZE_LIMIT,
  AI_GRAPH_UPLOAD_FILE_TYPE,
} from '@/common/ai';
import { insertDocumentFile } from '@/services/common/ai/document';
import { UploadOutlined } from '@ant-design/icons';
import { ModalForm, ProFormUploadDragger } from '@ant-design/pro-components';
import { Button, Form, UploadFile, message } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';

// 添加props类型
interface DocumentUploadProps {
  graph: string;
  workspace?: string;
  disabled?: boolean;
  refresh?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const DocumentUpload: React.FC<DocumentUploadProps> = (props) => {
  const { graph, workspace = '', disabled, refresh, className, style } = props;
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  const [form] = Form.useForm<API.AIGraphDocument_UploadType>();
  const handleUpload = async (values: API.AIGraphDocument_UploadType) => {
    setLoading(true);
    try {
      if (!values.files || values.files.length === 0) {
        message.error('请选择文件');
        return false;
      }
      const formData = new FormData();
      // 使用 Object.entries 遍历 values 并处理每个键值对
      Object.entries(values).forEach(([key, value]) => {
        // 处理 files 字段
        if (Array.isArray(value)) {
          // 将file的blob添加到formData中
          value.forEach((item) => {
            if (item?.originFileObj) {
              formData.append(key, item.originFileObj, item.originFileObj.name);
            } else {
              formData.append(key, item as any);
            }
          });
        } else {
          // 处理其他字段
          formData.append(key, value as any);
        }
      });
      await insertDocumentFile({ graph, workspace }, formData, {
        skipErrorHandler: true,
        timeout: 0,
      });
      // message.success("上传文档成功");
      return true;
    } catch (error: any) {
      const errorData = error?.data || error;
      message.error(errorData?.message || '上传文档失败');
      return false;
    } finally {
      setTimeout(() => {
        // 延迟刷新，防止上传后立即刷新导致异步数据未及时更新
        refresh?.();
        setLoading(false);
      }, 1000);
    }
  };
  useEffect(() => {
    // 获取当前文件列表
    const uploadFileList: UploadFile[] = [...fileList];
    // 计算总体大小
    const totalSize = uploadFileList.reduce(
      (acc, curr) => acc + (curr.size || 0),
      0,
    );
    // 跳过超出大小限制的文件
    if (
      AI_GRAPH_UPLOAD_FILE_SIZE_LIMIT &&
      totalSize > AI_GRAPH_UPLOAD_FILE_SIZE_LIMIT
    ) {
      message.error(
        `上传文件大小总计不能超过 ${AI_GRAPH_UPLOAD_FILE_SIZE_LIMIT / 1024 / 1024}MB`,
      );
      // 删除最后一个文件，直到总体大小在限制内
      uploadFileList.pop();
      setFileList(uploadFileList);
    }
  }, [fileList]);

  useEffect(() => {
    form?.resetFields();
    setFileList([]);
  }, [graph, form]);
  const isDisabled = disabled || loading;
  return (
    <ModalForm
      title="上传文档"
      disabled={isDisabled}
      trigger={
        <Button
          title="上传文档"
          className={classNames(className)}
          icon={<UploadOutlined />}
          type="primary"
          loading={loading}
          disabled={isDisabled}
        ></Button>
      }
      form={form}
      onOpenChange={(open) => {
        if (!open) {
          form?.resetFields();
          setFileList([]);
        }
      }}
      onFinish={async (values) => {
        const validate = await form?.validateFields();
        if (!validate) {
          return false;
        }
        await handleUpload(values);
        return true;
      }}
    >
      <ProFormUploadDragger
        label="文档"
        required
        name="files"
        max={10}
        accept={AI_GRAPH_UPLOAD_FILE_TYPE?.join(',')}
        rules={[
          {
            required: true,
            message: '请上传文档',
          },
        ]}
        fieldProps={{
          multiple: true,
          fileList: fileList,
          onChange: (info) => {
            setFileList(info.fileList);
          },
          beforeUpload: () => {
            return false;
          },
        }}
      />
      {/* <ProForm.Group>
        <ProFormSwitch
          required
          name="split_by_character_only"
          label="仅分割字符"
          tooltip="选中后，将仅使用分割字符进行分割，否则将使用默认分割方式"
          // 转换值为boolean
          valuePropName="checked"
          initialValue={false}
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

      {/* <ProFormTextArea
        name="description"
        label="摘要"
        // 显示字符串长度
        fieldProps={{
          showCount: true,
          maxLength: 1024,
        }}
        rules={[
          {
            required: false,
            message: '请输入文本',
          },
          {
            min: 2,
            max: 1024,
            message: '摘要长度为2到1024字符',
          },
        ]}
        placeholder="请输入摘要"
      /> */}
    </ModalForm>
  );
};

export default DocumentUpload;
