import { AI_VL_UPLOAD_FILE_TYPE } from '@/common/ai';
import { UPLOAD_FILE_SIZE_LIMIT, UPLOAD_FILE_TYPE } from '@/config/file.conf';
import { uploadFileApi } from '@/services/common/file';
import { UploadOutlined } from '@ant-design/icons';
import { ModalForm, ProFormRadio, ProFormUploadDragger } from '@ant-design/pro-components';
import { useRequest } from '@umijs/max';
import { Button, Form, message, UploadFile } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';

export interface FileListType {
    objectList: API.UploadedFileInfo[];
    fileList?: UploadFile[];
}

// 添加props类型
interface FileUploadModalProps {
    title?: string; // 标题
    btnType?: "link" | "text" | "primary" | "default" | "dashed" | undefined;// 按钮类型
    prefix?: string; // 前缀路径
    max?: number; // 最大上传文件数量
    isAutoOverwrite?: boolean; // 是否使用自动覆盖同名文件功能
    disabled?: boolean;
    handleUpload: (fileList: FileListType) => void;
    className?: string;
}

const FileUploadModal: React.FC<FileUploadModalProps> = (props) => {
    const { title = "文件上传", max = 5, btnType, prefix, isAutoOverwrite = false, disabled, handleUpload, className } = props;
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [form] = Form.useForm<any>();
    // 文件详情
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
                            if (!item?.size || item?.size > UPLOAD_FILE_SIZE_LIMIT) {
                                message.error(`文件大小超过限制：${UPLOAD_FILE_SIZE_LIMIT / 1024}MB`);
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
            if (prefix) {
                formData.append('prefix', prefix);
            }
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
                    type={btnType || "primary"}
                    disabled={disabled || loading}
                    loading={loading}
                />
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
                handleUpload({
                    objectList: result?.list || [],
                });
                return true;
            }}
        >
            <ProFormUploadDragger
                label="文件"
                required
                name="files"
                max={max}
                accept={UPLOAD_FILE_TYPE?.join(',')}
                rules={[
                    {
                        required: true,
                        message: '请上传文件',
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
            {isAutoOverwrite && (
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
            )
            }
        </ModalForm>
    );
};

export default FileUploadModal;



export const getBase64FormFileObj = (file: any, vison = true): Promise<string> => {
    // 判定file是否文件
    if (!(file instanceof File)) {
        return file;
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                let base64Data = reader.result as string;
                if (vison) {
                    base64Data = reader.result.split(',')[1] as string;
                }
                resolve(base64Data);
            } else {
                reject(new Error('无效的文件读取结果'));
            }
        };
        reader.onerror = (error) => reject(error);
    });
};

export const getArrayBuffer = (file: any): Promise<ArrayBuffer> => {
    // 判定file是否文件
    if (!(file instanceof File)) {
        return file;
    }

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = () => resolve(reader.result as ArrayBuffer);
        reader.onerror = (error) => reject(error);
    });
};
