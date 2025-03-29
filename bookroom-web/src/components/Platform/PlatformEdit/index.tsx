import { EditOutlined } from '@ant-design/icons';
import {
    ProTable,
} from '@ant-design/pro-components';
import { Button, Drawer, Flex } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';

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
    const [modalVisible, setModalVisible] = useState(false);
    const titleStr = title || "修改平台";
    const fieldValues = {
        ...data
    }
    if (data?.parameters && typeof data.parameters === "object") {
        fieldValues.parameters = JSON.stringify(data.parameters, null, 2);
    }
    if(data?.status){
        fieldValues.status =data.status.toString();
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
                footer={null}
            >
                <ProTable<API.PlatformInfo, API.PlatformInfo>
                    onSubmit={async (values: API.PlatformInfo) => {
                        const success = await onFinished(values);
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
                        // 默认值
                        initialValues: { ...fieldValues },
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

export default PlatformEdit;
