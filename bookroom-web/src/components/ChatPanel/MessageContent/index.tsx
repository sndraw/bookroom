import { Image, Space } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { ChatMessageType } from '../types';

import { previewFileApi } from '@/services/common/file';
import styles from './index.less';

// 定义消息内容组件的props类型
interface MessageContentType {
  msgObj: ChatMessageType;
  className?: string;
}
// 渲染消息内容组件
const MessageContent: React.FC<MessageContentType> = (props) => {
  const { msgObj, className } = props;
  // 图片预览列表
  const [imageList, setImageList] = useState<any[]>([]);
  // 语音预览
  const [audioList, setAudioList] = useState<any>(null);
  // 转换文件预览列表
  const transformFileList = async (files: any[] | undefined) => {
    const fileList = [];
    if (files && files?.length > 0) {
      const imagesBase64 = await Promise.all(
        files.map(async (file) => {
          // 获取图片的base64编码
          const res = await previewFileApi({
            fileId: file,
          });
          return res?.url;
        }),
      ); // 获取图片的base64编码
      fileList.push(imagesBase64);
    } 
    return fileList;
  };

  useEffect(() => {
    if (msgObj?.images) {
      transformFileList(msgObj.images).then((list) => {
        setImageList(list);
      });
    }
    if (msgObj?.audios) {
      transformFileList(msgObj.audios).then((list) => {
        setAudioList(list);
      });
    }
  }, [msgObj]);

  return (
    <>
      <div className={classNames(styles.messageContentText, className)}>
        {msgObj?.content}
      </div>
      {imageList && (
        <Space className={styles.imagePreviewContainer} wrap>
          {imageList?.map((image: string | undefined, index: any) => {
            return (
              <Image
                key={index}
                width={200}
                src={image}
                alt={`user-image-${index}`}
                className={styles.imagePreview}
              />
            );
          })}
        </Space>
      )}
      {audioList && (
        <Space className={styles.imagePreviewContainer} wrap>
          {audioList?.map((item: string | undefined, index: any) => {
            return (<audio controls>
              <source src={item} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            );
          })}
        </Space>
      )}
    </>
  );
};

export default MessageContent;
