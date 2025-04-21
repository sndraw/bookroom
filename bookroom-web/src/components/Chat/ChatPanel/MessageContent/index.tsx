import { Space } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { ChatMessageType } from '../types';

import { MarkdownWithHighlighting } from '@/components/Markdown';
import MediaPreview from '@/components/MediaPreview';
import styles from './index.less';

// 定义消息内容组件的props类型
interface MessageContentType {
  msgObj: ChatMessageType;
  className?: string;
}
// 渲染消息内容组件
const MessageContent: React.FC<MessageContentType> = (props) => {
  const { msgObj, className } = props;
  const [mediaList, setMediaList] = useState<any[]>([]);
  useEffect(() => {
    setMediaList([]);
    const { images = [], audios = [], videos = [], files = [] } = msgObj || {};
    if (images && Array.isArray(images)) {
      setMediaList(prevState => [...prevState, ...images]);
    }
    if (audios && Array.isArray(audios)) {
      setMediaList(prevState => [...prevState, ...audios]);
    }
    if (videos && Array.isArray(videos)) {
      setMediaList(prevState => [...prevState, ...videos]);
    }
    if (files && Array.isArray(files)) {
      setMediaList(prevState => [...prevState, ...files]);
    }
  }, [msgObj]);

  return (
    <>
      <div className={classNames(styles.messageContentText, className)}>
        <MarkdownWithHighlighting markdownContent={msgObj?.content} />
      </div>
      {mediaList.length > 0 && (
        <Space className={styles.mediaContainer} wrap align='center'>
          {mediaList.map((item, index) => (
            <MediaPreview key={index} href={item?.url || item?.objectId || item?.id || item} filePreview={true} />
          ))}
        </Space>
      )}

    </>
  );
};

export default MessageContent;
