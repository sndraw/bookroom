import { AI_LM_PLATFORM_MAP } from '@/common/ai';
import { PLATFORM_TYPE_MAP } from '@/common/platform';
import { STATUS_MAP } from '@/constants/DataMap';
import { PlusOutlined } from '@ant-design/icons';
import {
    ProTable,
} from '@ant-design/pro-components';
import { Button, Drawer, Flex, Form, message } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';

interface PlatformAddProps {
    columns: any;
    onFinished: (values: any) => Promise<boolean>;
    refresh?: () => void;
    disabled?: boolean;
    className?: string;
}

const PlatformAdd: React.FC<PlatformAddProps> = (props) => {
    const { columns, onFinished, refresh, disabled, className } = props;
    const [modalVisible, setModalVisible] = useState(false);
    return (
        <>
            <Button
                title="添加平台"
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                    setModalVisible(true);
                }}
                disabled={disabled}
                className={classNames(className)}
            />
            <Drawer
                destroyOnClose
                title="添加平台"
                width={"378px"}
                open={modalVisible}
                onClose={() => {
                    setModalVisible(false);
                }}
                footer={null}
            >
                <ProTable<API.PlatformInfo, API.PlatformInfo>
                    onSubmit={async (value: API.PlatformInfo) => {
                        const success = await onFinished(value);
                        if (success) {
                            setModalVisible(false);
                            refresh?.();
                        }
                    }}
                    rowKey="id"
                    type="form"
                    // @ts-ignore
                    columns={columns}
                    form={{
                        layout: 'horizontal', // 设置表单布局为水平布局
                        labelCol: { span: 6 }, // 标签占据的列数
                        wrapperCol: { span: 18 }, // 输入框占据的列数
                        // // 默认值
                        // initialValues: {
                        //     type: PLATFORM_TYPE_MAP.model.value,
                        //     code: AI_LM_PLATFORM_MAP.ollama.value,
                        //     status: String(STATUS_MAP.ENABLE.value),
                        // },
                        submitter: {
                            render: (_, dom) => (
                                <Flex gap={16} justify={'flex-end'}>
                                    {dom}
                                </Flex>
                            ),
                        },
                    }}
                />
            </Drawer>
        </>
    );
};

export default PlatformAdd;
