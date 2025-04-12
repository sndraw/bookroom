import {
  AI_VL_UPLOAD_FILE_SIZE_LIMIT,
  AI_VL_UPLOAD_FILE_TYPE,
} from '@/common/ai';
import { getUrlAndUploadFileApi } from '@/services/common/file';
import { PlusOutlined } from '@ant-design/icons';
import { Image, message, Upload, UploadFile } from 'antd';
import classNames from 'classnames';
import React, { useState } from 'react';
import styles from './index.less';
import { getBase64FormFileObj } from '@/components/File/FileUpload';

interface ImageUploadPreviewProps {
  title?: string; // 标题
  max?: number; // 最大文件数限制
  fileList: UploadFile[]; // 文件列表
  setFileList: (fileList: UploadFile[]) => void; // 设置文件列表的方法
  onSuccess: (key: string, vlaue: string) => void;
  className?: string;
}

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

const ImageUploadPreview: React.FC<ImageUploadPreviewProps> = (props) => {
  const { title, max = 5, onSuccess, fileList, setFileList, className } = props;
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
      <button style={{ border: 0, background: 'none' }} type="button">
        <PlusOutlined />
        <div style={{ marginTop: 8 }}>{title}</div>
      </button>
    );
  };

  return (
    <>
      <Upload
        className={classNames(styles.imageUpload, className)}
        listType="picture-card"
        accept={AI_VL_UPLOAD_FILE_TYPE?.join(',')}
        multiple={true}
        fileList={fileList}
        maxCount={max}
        onChange={async (info) => {
          const { file, fileList } = info;
          // 如果file不在fileList中
          const originFile = fileList.find(
            (item: { uid: any }) => item.uid === file.uid,
          );
          if (!originFile) {
            setFileList(info.fileList);
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
          // const objectId = crypto.randomUUID();
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
          onSuccess(file.uid, objectId);
          // 更新fileList
          setFileList(info.fileList);
        }}
        onPreview={handlePreview}
        beforeUpload={(file: UploadFile) => {
          return false;
        }}
      >
        {fileList?.length >= max ? null : <UploadButton />}
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

export default ImageUploadPreview;
