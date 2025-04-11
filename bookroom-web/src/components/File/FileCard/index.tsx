import { FolderOpenOutlined, CloudDownloadOutlined, CloseOutlined } from "@ant-design/icons";
import { useToken } from "@ant-design/pro-components";
import classNames from "classnames";
import { deleteFileApi, downloadFileApi } from "@/services/common/file";
import { Button, List, message, Popconfirm, Space } from "antd";
import MediaPreview from "@/components/MediaPreview";
import styles from "./index.less";

export const getFileName = (item?: API.FileInfo) => {
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

    // 下载文件
    const downloadFileHandle = () => {
        const fileId = item?.id || "";
        downloadFileApi({ fileId: encodeURIComponent(fileId) }, {
            skipErrorHandler: true,
            responseType: 'blob', // 获取二进制数据
        }).then((binaryData) => {
            const imageUrl = URL.createObjectURL(binaryData);
            const link = document.createElement('a'); // 创建a标签
            link.href = imageUrl;
            link.download = item?.id || ""; // 设置下载文件名
            link.click(); // 触发点击事件
            link.remove(); // 清除a标签
            window.URL.revokeObjectURL(imageUrl); // 释放URL
        });
    }

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


    // 获取文件名
    const fileName = getFileName(item);

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
                                    {item?.lastModified &&<div className={styles.cardItemUpdateTime}>更新时间：{new Date(item?.lastModified).toLocaleString()}</div>}
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
                                        type="link"
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
                {!item?.isDir && <span
                    title={'下载'}
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
                </span>
                }
            </Space>
        </List.Item>
    );

}


export default FileCard