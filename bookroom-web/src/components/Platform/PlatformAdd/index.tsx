import { PlusOutlined } from '@ant-design/icons';
import {
    ProTable,
} from '@ant-design/pro-components';
import { Button, Drawer, Flex, Form, FormInstance } from 'antd';
import classNames from 'classnames';
import React, { useRef, useState } from 'react';

interface PlatformAddProps {
    title?: string;
    columns: any;
    onFinished: (values: any) => Promise<boolean>;
    refresh?: () => void;
    disabled?: boolean;
    className?: string;
}

const PlatformAdd: React.FC<PlatformAddProps> = (props) => {
    const { title, columns, onFinished, refresh, disabled, className } = props;
    const formRef = useRef<FormInstance | undefined>(undefined);
    const [modalVisible, setModalVisible] = useState(false);
    const titleStr = title || "添加配置";

    return (
        <>
            <Button
                title={titleStr}
                type="primary"
                shape="circle"
                icon={<PlusOutlined />}
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
                    formRef={formRef}
                    type="form"
                    // @ts-ignore
                    columns={columns}
                    form={{
                        // layout: 'horizontal',
                        // labelCol: { span: 6 }, // 标签占据的列数
                        // wrapperCol: { span: 18 }, // 输入框占据的列数
                        layout: 'vertical',
                        submitter: false
                    }}
                />
            </Drawer>
        </>
    );
};

export default PlatformAdd;
