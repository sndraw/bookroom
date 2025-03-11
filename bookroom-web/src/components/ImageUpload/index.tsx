import {
  AI_VL_UPLOAD_FILE_SIZE_LIMIT,
  AI_VL_UPLOAD_FILE_TYPE,
} from '@/common/ai';
import { PlusOutlined } from '@ant-design/icons';
import { Image, message, Upload, UploadFile } from 'antd';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

// 添加props类型
interface ImageUploadProps {
  title?: string; // 标题
  max?: number; // 最大文件数限制
  className?: string;
  fileList: UploadFile[];
  setFileList: (fileList: UploadFile[]) => void; // 设置文件列表的回调函数
}

export const getFileBase64 = (file: any, vison = true): Promise<string> => {
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

export const fixFileBase64 = (file: any) => {
  // 判定file是否base64
  if (typeof file !== 'string') {
    return file;
  }
  if (file.startsWith('data:image/')) {
    return file;
  }
  if (file.includes(';base64,')) {
    return file;
  }
  const dataUri = `data:image/png;base64,${file}`;
  return dataUri;
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
  const { title, max = 5, className, fileList, setFileList } = props;
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getFileBase64(file.originFileObj, false);
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

  useEffect(() => {
    // 获取当前文件列表
    const uploadFileList: UploadFile[] = [...fileList];
    // 计算总体大小
    const totalSize = uploadFileList.reduce(
      (acc, curr) => acc + (curr.size || 0),
      0,
    );
    // 跳过超出大小限制的文件
    if (
      AI_VL_UPLOAD_FILE_SIZE_LIMIT &&
      totalSize > AI_VL_UPLOAD_FILE_SIZE_LIMIT
    ) {
      message.error(
        `上传文件大小总计不能超过 ${AI_VL_UPLOAD_FILE_SIZE_LIMIT / 1024 / 1024}MB`,
      );
      // 删除最后一个文件，直到总体大小在限制内
      uploadFileList.pop();
      setFileList(uploadFileList);
    }
  }, [fileList]);

  return (
    <>
      <Upload
        className={classNames(styles.imageUpload, className)}
        listType="picture-card"
        accept={AI_VL_UPLOAD_FILE_TYPE?.join(',')}
        multiple={true}
        fileList={fileList}
        maxCount={max}
        onChange={(info) => {
          setFileList(info.fileList);
        }}
        onPreview={handlePreview}
        beforeUpload={() => {
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

export default ImageUpload;
