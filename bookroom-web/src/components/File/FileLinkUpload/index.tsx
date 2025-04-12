import { CloseOutlined, LinkOutlined, UploadOutlined } from "@ant-design/icons";
import { DrawerForm } from "@ant-design/pro-components";
import { Button, Card, Form, Input, Space, UploadFile } from "antd";
import classNames from "classnames";
import { useState } from "react";
import styles from "./index.less";

// 添加props类型
interface FileLinkUploadProps {
    title?: string; // 标题
    btnType?: "link" | "text" | "primary" | "default" | "dashed" | undefined;// 按钮类型
    loading?: boolean; // 加载状态
    disabled?: boolean;
    handleUpload: (record: Record<string, any>) => void;
    className?: string;
}

const FileLinkUpload: React.FC<FileLinkUploadProps> = (props) => {
    const { title = "文件链接", btnType, loading, disabled, handleUpload, className } = props;
    const [form] = Form.useForm<any>();

    return (
        <DrawerForm
            title={title}
            disabled={disabled}
            loading={loading}
            className={styles.container}
            width={"378px"}
            trigger={
                <Button
                    title={title}
                    className={classNames(className)}
                    icon={<LinkOutlined />}
                    type={btnType || "text"}
                    disabled={disabled || loading}
                    loading={loading}
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
                // 遍历过滤掉重复的链接，并赋值给 values.links
                const uniqueLinks = Array.from(new Set(values.links.map((link: { url: any; }) => link.url))).map(url => ({ url }));
                values.links = uniqueLinks;
                handleUpload(values);
                return true;
            }}
        >
            <Form.List name="links">
                {(fields, { add, remove }) => (
                    <div style={{ display: 'flex', rowGap: 16, flexDirection: 'column' }}>
                        {fields.map((field) => (
                            <Card
                                size="small"
                                title={`链接 ${field.name + 1}`}
                                key={field.key}
                                extra={
                                    <CloseOutlined
                                        onClick={() => {
                                            remove(field.name);
                                        }}
                                    />
                                }
                            >
                                <Form.Item name={[field.name, 'url']}  label="文件名/链接" rules={[{ required: true, message: '请输入文件名/链接' }]}>
                                    <Input />
                                </Form.Item>
                            </Card>
                        ))}

                        <Button type="dashed" onClick={() => add()} block>
                            + 添加文件名或者链接
                        </Button>
                    </div>
                )}
            </Form.List>
        </DrawerForm>
    );
}
export default FileLinkUpload;