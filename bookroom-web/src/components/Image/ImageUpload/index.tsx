import {
  AI_VL_UPLOAD_FILE_SIZE_LIMIT,
  AI_VL_UPLOAD_FILE_TYPE,
} from '@/common/ai';
import { getUrlAndUploadFileApi } from '@/services/common/file';
import { PictureOutlined } from '@ant-design/icons';
import { Button, Image, message, Upload, UploadFile } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import styles from './index.less';
import { UploadListType } from 'antd/es/upload/interface';
import { getBase64FormFileObj } from '@/components/File/FileUpload';

export interface ImageListType {
  objectList: API.UploadedFileInfo[];
  fileList: UploadFile[];
}


interface ImageUploadProps {
  title?: string; // 标题
  max?: number; // 最大文件数限制
  multiple?: boolean; // 是否支持多选
  listType?: UploadListType; // 列表类型
  showUploadList?: boolean; // 是否显示上传列表
  imageList?: ImageListType; // 图片列表
  setImageList: React.Dispatch<React.SetStateAction<ImageListType | undefined>>; // 设置图片列表
  onRemove?: (params: { id: string }) => void;
  onSuccess?: (params: { id: string, objectId: string, file: File }) => void;
  className?: string;
}


const ImageUpload: React.FC<ImageUploadProps> = (props) => {
  const {
    title = "上传图片",
    max = 5,
    listType = "picture-card",
    showUploadList = true,
    imageList = [] as any,
    setImageList,
    onSuccess,
    onRemove,
    className
  } = props;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64FormFileObj(file.originFileObj, false);
    }
    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
  };

  const UploadButton = () => {
    return (
      <Button icon={<PictureOutlined />} title={title} type="text" />
    );
  };

  return (
    <>
      <Upload
        className={classNames(styles.imageUpload, className)}
        listType={listType}
        accept={AI_VL_UPLOAD_FILE_TYPE?.join(',')}
        multiple={true}
        showUploadList={showUploadList}
        fileList={imageList?.fileList}
        maxCount={max}
        onChange={async (info) => {
          const { file, fileList } = info;
          const originFile = fileList.find(
            (item: { uid: any }) => item.uid === file.uid,
          );
          // 如果file不在fileList中
          if (!originFile) {
            onRemove?.({
              id: file.uid
            })
            setImageList({
              objectList: imageList?.objectList?.filter((item: { id: any }) => item.id !== file.uid),
              fileList: imageList?.fileList?.filter((item: { uid: any }) => item.uid !== file.uid),
            });
            return;
          }
          // 判定file大小
          if (!file?.size || file?.size > AI_VL_UPLOAD_FILE_SIZE_LIMIT) {
            message.error(`文件大小超过限制：${AI_VL_UPLOAD_FILE_SIZE_LIMIT / 1024}MB`);
            return;
          }
          if (!originFile?.originFileObj) {
            return;
          }
          const objectId =
            new Date().getTime() + '_' + originFile.originFileObj.name;
          // 上传文件
          const isUploaded = await getUrlAndUploadFileApi(
            {
              objectId,
            },
            {
              file: originFile.originFileObj,
            },
          );
          if (!isUploaded) {
            return;
          }
          onSuccess?.({
            objectId,
            id: file.uid,
            file: originFile.originFileObj, // 添加文件对象
          });
          // 上传成功后，更新imageList
          setImageList(prevState => ({
            objectList: [...(prevState?.objectList || []), { id: file.uid, objectId }],
            fileList: [...fileList],
          }));
        }}
        onPreview={handlePreview}
        beforeUpload={(file: UploadFile) => {
          return false;
        }}
      >
        {imageList?.objectList?.length >= max ? null : <UploadButton />}
      </Upload>
      {previewImage && (
        <Image
          wrapperStyle={{ display: 'none' }}
          className={styles.imagePreview}
          preview={{
            visible: previewOpen,
            onVisibleChange: (visible) => setPreviewOpen(visible),
            afterOpenChange: (visible) => !visible && setPreviewImage(''),
          }}
          src={previewImage}
        />
      )}
    </>
  );
};

export default ImageUpload;
