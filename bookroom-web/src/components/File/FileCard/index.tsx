import { FolderOpenOutlined, CloudDownloadOutlined, CloseOutlined, FileMarkdownOutlined } from "@ant-design/icons";
import { useToken } from "@ant-design/pro-components";
import classNames from "classnames";
import { deleteFileApi, downloadFileApi } from "@/services/common/file";
import { Button, List, message, Popconfirm, Space } from "antd";
import MediaPreview from "@/components/MediaPreview";
import CopyToClipboard from "@/components/CopyToClipboard";
import { FileItem } from "../FileListPanel";
import styles from "./index.less";

export const getFileOrDirName = (item?: API.FileInfo | FileItem) => {
    let fileName = item?.name;
    // 如果是文件夹，删除尾部斜杠
    if (item?.isDir) {
        fileName = item?.name?.slice(0, -1);
    }
    // 删除斜杠
    if (fileName?.includes("/")) {
        fileName = fileName.split("/").pop();
    }
    return fileName || "";
}


type FileCardPropsType = {
    // 当前GPU
    item?: API.FileInfo;
    // 跳转
    redirect: () => void;
    // 刷新
    refresh: () => void;
    // 样式
    className?: string;
}
const FileCard: React.FC<FileCardPropsType> = (props: FileCardPropsType) => {
    const { item, refresh, redirect, className } = props;
    // 主题
    const { token } = useToken();


    // 获取文件名
    const fileName = getFileOrDirName(item);
    // 模型识别代码
    const markdownCode = `[${fileName}](${item?.url || item?.id})`

    // 下载文件
    const downloadFileHandle = async () => {
        const fileId = item?.id || "";
        try {
            const data = await downloadFileApi({ fileId: encodeURIComponent(fileId) }, {
                skipErrorHandler: true,
            })
            if (data?.url) {
                // 发起请求获取文件数据
                const response = await fetch(data?.url);
                if (!response.ok) {
                    throw new Error(`获取下载文件失败: ${response.statusText}`);
                }
                // 将响应转换为 Blob
                const blob = await response.blob();
                // 创建一个指向 Blob 的临时 URL
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a'); // 创建a标签
                link.href = url; // 设置href属性为下载链接
                link.download = fileName || ""; // 设置download属性为文件名
                document.body.appendChild(link); // 将a标签添加到body中
                link.click(); // 触发点击事件，开始下载
                document.body.removeChild(link); // 下载完成后移除a标签
                window.URL.revokeObjectURL(url); // 释放临时 URL
            } else {
                throw new Error("下载链接不存在");
            }
        } catch (error: any) {
            message.error(error?.message || error?.info || "未知错误");
        }

    };

    const handleRemove = async () => {
        try {
            const fileId = item?.id || "";
            if (!fileId) {
                throw new Error("文件/文件夹ID不存在");
            }
            const result = await deleteFileApi({ fileId: encodeURIComponent(fileId) });
            if (result) {
                message.success("删除成功");
                return true; // 删除成功
            } else {
                return false;
            }

        } catch (error) {
            message.error("删除失败");
            console.error("删除文件/文件夹失败", error);
            return false;
        }
    };

    return (
        <List.Item className={classNames(styles.cardItem, className)}>
            <List.Item.Meta
                className={styles.cardItemMeta}
                title={
                    <>
                        {item?.isDir &&
                            <div className={styles.cardItemBox} style={{ cursor: "pointer" }} onClick={() => {
                                redirect();
                            }} >
                                <FolderOpenOutlined className={styles.cardItemFolder} style={{
                                    color: token.gold
                                }} />
                                <div className={styles.cardItemTitle} title={fileName}>{fileName}</div>
                            </div>
                        }
                        {!item?.isDir &&
                            <>
                                <div className={styles.cardItemBox}>
                                    <MediaPreview className={styles.cardItemFile} href={String(item?.url || item?.id)} />
                                    <div className={styles.cardItemTitle} title={fileName}>{fileName}</div>
                                    {item?.lastModified && <div className={styles.cardItemUpdateTime}>更新时间：{new Date(item?.lastModified).toLocaleString()}</div>}
                                </div>
                                <Popconfirm
                                    className={styles.cardItemDeleteBtn}
                                    key="option-delete"
                                    title={`是否确认删除?`}
                                    onConfirm={async () => {
                                        const result = await handleRemove();
                                        if (result) {
                                            refresh();
                                        }
                                    }}
                                    okText="是"
                                    cancelText="否"
                                >
                                    <Button
                                        type="text"
                                        title={'删除'}
                                        danger
                                        key={'option-delete-btn'}
                                        icon={<CloseOutlined />}
                                    />
                                </Popconfirm>
                            </>
                        }
                    </>
                }
            />
            <Space className={classNames(styles.cardItemActions)}>
                {!item?.isDir &&
                    <>
                        {/* 复制 */}
                        <CopyToClipboard title="复制文件名" content={item?.url || item?.id || ""} />
                        {/* 复制 */}
                        <CopyToClipboard title="复制Markdown预览地址" icon={<FileMarkdownOutlined />} content={markdownCode} />
                        <Button
                            title={'下载'}
                            type="link"
                            className={classNames(
                                styles.cardItemBtn,
                            )}
                            onClick={() => {
                                downloadFileHandle();
                            }}
                        >
                            <CloudDownloadOutlined
                                style={{
                                    color: token.colorPrimary,
                                }}
                            />
                        </Button>
                    </>
                }
            </Space>
        </List.Item>
    );

}


export default FileCard