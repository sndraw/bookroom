import {
  AI_VL_UPLOAD_FILE_SIZE_LIMIT,
  AI_VL_UPLOAD_FILE_TYPE,
} from '@/common/ai';
import { getUrlAndUploadFileApi } from '@/services/common/file';
import { PictureOutlined } from '@ant-design/icons';
import { Button, Image, Upload, UploadFile } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import styles from './index.less';
import { UploadListType } from 'antd/es/upload/interface';

interface ImageUploadProps {
  title?: string; // 标题
  max?: number; // 最大文件数限制
  multiple?: boolean; // 是否支持多选
  listType?: UploadListType; // 列表类型
  showUploadList?: boolean; // 是否显示上传列表
  imageList?: ImageListType; // 图片列表
  setImageList: React.Dispatch<React.SetStateAction<ImageListType | undefined>>; // 设置图片列表
  onRemove?: (params: { fileId: string }) => void;
  onSuccess?: (params: { fileId: string, objectId: string, file: File }) => void;
  className?: string;
}

export interface ImageListType {
  objectList: Array<{
    objectId: string; // 对象ID
    fileId: string; // 文件ID
  }>;
  fileList: UploadFile[];
}

export const getBase64FormFileObj = (file: any, vison = true): Promise<string> => {
  // 判定file是否文件
  if (!(file instanceof File)) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        let base64Data = reader.result as string;
        if (vison) {
          base64Data = reader.result.split(',')[1] as string;
        }
        resolve(base64Data);
      } else {
        reject(new Error('无效的文件读取结果'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const getArrayBuffer = (file: any): Promise<ArrayBuffer> => {
  // 判定file是否文件
  if (!(file instanceof File)) {
    return file;
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = (error) => reject(error);
  });
};

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
              fileId: file.uid
            })
            setImageList({
              objectList: imageList?.objectList?.filter((item: { fileId: any }) => item.fileId !== file.uid),
              fileList: imageList?.fileList?.filter((item: { uid: any }) => item.uid !== file.uid),
            });
            return;
          }
          // 判定file大小
          if (!file?.size || file?.size > AI_VL_UPLOAD_FILE_SIZE_LIMIT) {
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
            fileId: file.uid,
            file: originFile.originFileObj, // 添加文件对象
          });
          // 上传成功后，更新imageList
          setImageList(prevState => ({
            objectList: [...(prevState?.objectList || []), { fileId: file.uid, objectId }],
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
