import { previewFileApi } from '@/services/common/file';
import { isAudio, isImage, isVideo } from '@/utils/file';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { Image } from 'antd';
import { FileOutlined } from '@ant-design/icons';
import styles from './index.less';

interface Props {
    href: string;
    className?: string;
    // 是否预览文件
    filePreview?: boolean;
}

const MediaPreview: React.FC<Props> = ({ href, className, filePreview }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchPreviewUrl = async () => {
            // 如果href不是字符串
            if (typeof href !== 'string') {
                return;
            }
            try {
                setLoading(true);
                // 如果是https/http开头的链接，直接使用href作为预览地址
                if (href.startsWith('http') || href.startsWith('https')) {
                    setPreviewUrl(href);
                    setLoading(false);
                    return;
                }
                const result = await previewFileApi({
                    fileId: encodeURIComponent(href),
                });
                if (result?.url) {
                    setPreviewUrl(result.url);
                }
            } catch (error) {
                console.error('Error fetching preview URL:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPreviewUrl();
    }, [href]);
    // 截取文件名
    const fileName = href?.split('/').pop() || '';
    if (loading) {
        return <div className={classNames(styles.mediaPreview, className)}>Loading...</div>; // 或者显示一个加载中的占位符
    }
    if (!previewUrl) {
        return null; // 或者显示一个错误信息
    }

    if (isAudio(href)) {
        return (
            <audio title={fileName} className={classNames(styles.mediaPreview, className)} controls key={href}>
                <source src={previewUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio>
        );
    }
    if (isVideo(href)) {
        return (
            <video title={fileName} className={classNames(styles.mediaPreview, className)} controls key={href}>
                <source src={previewUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        );
    }
    if (isImage(href)) {
        return (
            <Image
                title={fileName}
                className={classNames(styles.mediaPreview, styles.imagePreview, className)}
                src={previewUrl}
                key={href}
            />)
    }
    if (filePreview) {
        return (
            <a href={previewUrl}
                title={fileName}
                target="_blank"
                rel="noopener noreferrer"
                className={classNames(styles.mediaPreview, styles.filePreview, className)}>
                <FileOutlined className={styles.fileIcon} />
                <span className={styles.fileName}>{fileName}</span>
            </a>
        );
    }


    return (
        <FileOutlined className={classNames(styles.mediaPreview, className)} />
    )
};

export default MediaPreview;