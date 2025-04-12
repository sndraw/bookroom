import { AI_VL_UPLOAD_FILE_SIZE_LIMIT, AI_VL_UPLOAD_FILE_TYPE } from '@/common/ai';
import { uploadFileApi } from '@/services/common/file';
import { UploadOutlined } from '@ant-design/icons';
import { ModalForm, ProFormRadio, ProFormUploadDragger } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { Button, Form, message, UploadFile } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';

// 添加props类型
interface ImageUploadModalProps {
  title?: string; // 标题
  disabled?: boolean;
  handleUpload: (fileList: API.UploadedFileInfo[]) => void;
  className?: string;
}

const ImageUploadModal: React.FC<ImageUploadModalProps> = (props) => {
  const { title, disabled, handleUpload, className } = props;
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [form] = Form.useForm<any>();
  // 文档详情
  const { data, loading, error, run } = useRequest(
    (values) => {
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
              // 判定file大小
              if (!item?.size || item?.size > AI_VL_UPLOAD_FILE_SIZE_LIMIT) {
                message.error(`文件大小超过限制：${AI_VL_UPLOAD_FILE_SIZE_LIMIT / 1024}MB`);
                // 文件大小超过限制，无法上传。
                return;
              }
              formData.append(
                key,
                item.originFileObj,
                item.originFileObj.name,
              );
            } else {
              formData.append(key, item as any);
            }
          });
        } else {
          // 处理其他字段
          formData.append(key, value as any);
        }
      });
      return uploadFileApi(formData);
    },
    {
      manual: true,
    },
  );
  return (
    <ModalForm
      title={title}
      disabled={disabled || loading}
      loading={loading}
      trigger={
        <Button
          title={title}
          className={classNames(className)}
          icon={<UploadOutlined />}
          type="default"
          disabled={disabled || loading}
          loading={loading}
        >
          {title}
        </Button>
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
        if (!values.files || values.files.length === 0) {
          message.error('请选择文件');
          return false;
        }
        const result = await run(values);
        if (!result) {
          return false;
        }
        handleUpload(result?.list);
        return true;
      }}
    >
      <ProFormUploadDragger
        label="图片"
        required
        name="files"
        max={10}
        accept={AI_VL_UPLOAD_FILE_TYPE?.join(',')}
        rules={[
          {
            required: true,
            message: '请上传图片',
          },
        ]}
        fieldProps={{
          multiple: true,
          fileList: fileList,
          onChange: (info) => {
            setFileList(info.fileList);
          },
          beforeUpload: (file) => {
            return false;
          },
        }}
      />
      <ProFormRadio.Group
        name="autoOverwrite"
        label="覆盖同名文件"
        required
        initialValue={false}
        options={[
          { label: '是', value: true },
          { label: '否', value: false },
        ]}
      />
    </ModalForm>
  );
};

export default ImageUploadModal;
