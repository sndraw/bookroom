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
  const [voice, setVoice] = useState<any>(null);
  // 转换图片预览列表
  const transformImageList = async (images: any[] | undefined) => {
    if (images && images?.length > 0) {
      const imagesBase64 = await Promise.all(
        images.map(async (image) => {
          // 获取图片的base64编码
          const res = await previewFileApi({
            fileId: image,
          });
          return res?.url;
        }),
      ); // 获取图片的base64编码
      setImageList(imagesBase64);
    } else {
      setImageList([]);
    }
  };

  // 转换语音预览
  const transformVoice = async (voice: any) => {
    if (voice) {
      const res = await previewFileApi({
        fileId: voice,
      });
      setVoice(res?.url);
    } else {
      setVoice(null);
    }
  };

  useEffect(() => {
    transformImageList(msgObj?.images);
    transformVoice(msgObj?.voice);
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
      {voice && (
        <div className={styles.voicePreviewContainer}>
          <audio controls>
            <source src={voice} type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </>
  );
};

export default MessageContent;
