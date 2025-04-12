import { Image, Space } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { ChatMessageType } from '../types';

import { previewFileApi } from '@/services/common/file';
import { MarkdownWithHighlighting } from '@/components/Markdown';
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
  // 视频预览
  const [videoList, setVideoList] = useState<any>(null);
  // 文件预览
  const [fileList, setFileList] = useState<any[]>([]);


  // 转换base64列表
  const transformBase64List = async (files: any[] | undefined) => {
    if (files && files?.length > 0) {
      const base64List = await Promise.all(
        files.map(async (file) => {
          // 获取base64编码
          const res = await previewFileApi({
            fileId: encodeURIComponent(file),
          });
          return res?.url;
        }),
      );
      return base64List;
    }
    return [];
  };

  // 转换markdown格式链接列表
  const transformLinkStrList = async (files: any[] | undefined) => {
    if (files && files?.length > 0) {
      const linkList = files.map((file) => {
        return `[${file?.name || file?.id || file}](${file?.url || file?.id || file})`
      });
      return linkList;
    }
    return [];
  };


  useEffect(() => {
    if (msgObj?.images) {
      transformBase64List(msgObj.images).then((base64List) => {
        setImageList(base64List);
      });
    }
    if (msgObj?.audios) {
      transformBase64List(msgObj.audios).then((base64List) => {
        setAudioList(base64List);
      });
    }
    if (msgObj?.videos) {
      transformBase64List(msgObj.videos).then((base64List) => {
        setVideoList(base64List);
      });
    }
    // 如果是文件类型
    if (msgObj?.files) {
      // 转换成markdown格式
      transformLinkStrList(msgObj.files).then((linkStrList) => {
        setFileList(linkStrList);
      });
    }


  }, [msgObj])

  return (
    <>
      <div className={classNames(styles.messageContentText, className)}>
        <MarkdownWithHighlighting markdownContent={msgObj?.content} />
      </div>
      {imageList && (
        <Space className={styles.imagePreviewContainer} wrap>
          {imageList?.map((image: string | undefined, index: any) => {
            return (
              <Image
                key={index}
                width={100}
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
            return (<audio controls key={index}>
              <source src={item} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            );
          })}
        </Space>
      )}
      {videoList && (
        <Space className={styles.imagePreviewContainer} wrap>
          {videoList?.map((item: string | undefined, index: any) => {
            return (
              <video width="320" height="240" controls key={index}>
                <source src={item} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            );
          })}
        </Space>
      )}

      {fileList && (
        <Space className={styles.filePreviewContainer} wrap>
          {fileList?.map((item: string | undefined, index: any) => {
            return <MarkdownWithHighlighting key={index} markdownContent={item || ""} />
          })}
        </Space>
      )}
    </>
  );
};

export default MessageContent;
