import { PlusOutlined } from '@ant-design/icons';
import {
    ProTable,
} from '@ant-design/pro-components';
import { Button, Drawer, Flex } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';

interface RoleAddProps {
    title?: string;
    columns: any;
    onFinished: (values: any) => Promise<boolean>;
    refresh?: () => void;
    disabled?: boolean;
    className?: string;
}

const RoleAdd: React.FC<RoleAddProps> = (props) => {
    const { title, columns, onFinished, refresh, disabled, className } = props;
    const [modalVisible, setModalVisible] = useState(false);
    const titleStr = title || "添加角色";
    return (
        <>
            <Button
                title={titleStr}
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
                title={titleStr}
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

export default RoleAdd;
