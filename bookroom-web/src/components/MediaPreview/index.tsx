import { previewFileApi } from '@/services/common/file';
import { isAudio, isImage, isVideo } from '@/utils/file';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { Image } from 'antd';
import styles from './index.less';
import { set } from 'mermaid/dist/diagrams/state/id-cache.js';
import { FileOutlined } from '@ant-design/icons';
import { useToken } from '@ant-design/pro-components';

interface Props {
    href: string;
    className?: string;
}

const MediaPreview: React.FC<Props> = ({ href, className }) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    // 主题
    const { token } = useToken();

    useEffect(() => {
        const fetchPreviewUrl = async () => {
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

    if (loading) {
        return <div className={classNames(styles.mediaPreview, className)}>Loading...</div>; // 或者显示一个加载中的占位符
    }
    if (!previewUrl) {
        return null; // 或者显示一个错误信息
    }

    if (isAudio(href)) {
        return (
            <audio className={classNames(styles.mediaPreview, className)} controls key={href}>
                <source src={previewUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
            </audio>
        );
    }
    if (isVideo(href)) {
        return (
            <video className={classNames(styles.mediaPreview, className)} controls key={href}>
                <source src={previewUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        );
    }
    if (isImage(href)) {
        return (
            <Image
                className={classNames(styles.mediaPreview, className)}
                src={previewUrl}
                key={href}
            />)
    }

    return (
        <FileOutlined className={classNames(styles.mediaPreview, className)} />
    )
};

export default MediaPreview;