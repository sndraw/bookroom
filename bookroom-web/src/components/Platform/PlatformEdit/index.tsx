import { EditOutlined } from '@ant-design/icons';
import {
    ProTable,
} from '@ant-design/pro-components';
import { Button, Drawer, Flex, FormInstance } from 'antd';
import classNames from 'classnames';
import React, { useRef, useState } from 'react';

interface PlatformEditProps {
    title?: string;
    data: API.PlatformInfo;
    columns: any;
    onFinished: (values: any) => Promise<boolean>;
    refresh?: () => void;
    disabled?: boolean;
    className?: string;
}

const PlatformEdit: React.FC<PlatformEditProps> = (props) => {
    const { title, data, columns, onFinished, refresh, disabled, className } = props;
    const formRef = useRef<FormInstance | undefined>(undefined);
    const [modalVisible, setModalVisible] = useState(false);
    const titleStr = title || "修改配置";
    const fieldValues = {
        ...data
    }
    if (data?.parameters && typeof data.parameters === "object") {
        fieldValues.parameters = JSON.stringify(data.parameters, null, 2);
    }
    if (data?.status) {
        fieldValues.status = data.status.toString();
    }

    return (
        <>
            <Button
                title={titleStr}
                type="text"
                icon={<EditOutlined />}
                onClick={() => {
                    setModalVisible(true);
                }}
                disabled={disabled}
                className={classNames(className)}
            />
            <Drawer
                destroyOnClose
                title={titleStr}
                width={"378px"}
                open={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                }}
                footer={
                    <Flex style={{ gap: 16, justifyContent: 'flex-end' }}>
                        {/* 提交按钮 */}
                        <Button type="primary" onClick={async () => {
                            if (formRef.current) {
                                formRef.current.validateFields().then(async (values) => {
                                    const success = await onFinished(values);
                                    if (success) {
                                        setModalVisible(false);
                                        refresh?.();
                                    }
                                }).catch((errorInfo) => {
                                    console.log('表单验证失败', errorInfo);
                                });
                            }
                        }}>提交</Button>
                        <Button onClick={() => setModalVisible(false)}>取消</Button>
                    </Flex>
                }
            >
                <ProTable<API.PlatformInfo, API.PlatformInfo>
                    rowKey="id"
                    type="form"
                    formRef={formRef}
                    // @ts-ignore
                    columns={columns}
                    form={{
                        // layout: 'horizontal', // 设置表单布局为水平布局
                        // labelCol: { span: 6 }, // 标签占据的列数
                        // wrapperCol: { span: 18 }, // 输入框占据的列数
                        layout: 'vertical',
                        // 默认值
                        initialValues: { ...fieldValues },
                        submitter: false
                    }}
                />
            </Drawer>
        </>
    );
};

export default PlatformEdit;
