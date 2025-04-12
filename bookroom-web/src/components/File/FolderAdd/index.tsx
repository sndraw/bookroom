import { FolderAddOutlined } from '@ant-design/icons';
import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { Button, Form, UploadFile } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';

// 添加props类型
interface FolderAddProps {
    title?: string; // 标题
    prefix?: string; // 前缀路径
    btnType?: "link" | "text" | "primary" | "default" | "dashed" | undefined;// 按钮类型
    disabled?: boolean;
    onFinished: (values: Record<string,any>) => void; // 文件上传成功后的回调函数
    className?: string;
}

const FolderAdd: React.FC<FolderAddProps> = (props) => {
    const { title="创建文件夹", btnType, prefix, disabled, onFinished, className } = props;
    const [form] = Form.useForm<any>();

    return (
        <ModalForm
            title={title}
            disabled={disabled}
            trigger={
                <Button
                    title={title}
                    className={classNames(className)}
                    icon={<FolderAddOutlined />}
                    type={btnType || "primary"}
                    disabled={disabled}
                />
            }
            form={form}
            onOpenChange={(open) => {
                if (!open) {
                    form?.resetFields();
                }
            }}
            onFinish={async (values) => {
                const validate = await form?.validateFields();
                if (!validate) {
                    return false;
                }
                onFinished?.({
                   ...values,
                    prefix: prefix || "", // 如果prefix存在则添加到folderName前面
                });
                return true;
            }}
        >
            <ProFormText
                name="folderName"
                label="文件夹名称"
                rules={[{ required: true, message: "请输入文件夹名称"}]}
                placeholder="请输入文件夹名称"
            />
        </ModalForm>
    );
};

export default FolderAdd;
