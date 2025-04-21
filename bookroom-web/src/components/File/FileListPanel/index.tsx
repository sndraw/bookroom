import { Button, Flex, Image, UploadFile } from 'antd';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import styles from './index.less';
import { previewFileApi } from '@/services/common/file';
import { CloseOutlined } from '@ant-design/icons';
import { FileListType, getBase64FormFileObj } from '../FileUpload';
import MediaPreview from '@/components/MediaPreview';
import { getFileOrDirName } from '../FileCard';

// 添加props类型
interface FileLinkListProps {
  title?: string;
  dataList?: FileListType; // 文件列表
  setDataList: React.Dispatch<React.SetStateAction<FileListType | undefined>>; // 设置文件列表
  className?: string;
}
export type FileItem = {
  id: string;
  name: string;
  url: string;
  isDir?: boolean;
};
const FileListPanel: React.FC<FileLinkListProps> = (props) => {
  const { title, className, dataList, setDataList } = props;
  const [fileList, setFileList] = React.useState<FileItem[]>([])
  // 删除文件的逻辑
  const handleDelete = async (uid: string) => {
    // 查询是否包含该id的file
    const objectItem = dataList?.objectList.find(item => item.id === uid);
    if (objectItem) {
      const newObjectIdList = dataList?.objectList.filter(item => item.objectId !== objectItem.objectId) || [];
      const newFileList = dataList?.fileList?.filter(item => item.uid !== objectItem.id) || [];
      // 更新状态
      setDataList(prevState => ({
        objectList: [...newObjectIdList],
        fileList: [...newFileList]
      }));
    }

  };
  useEffect(() => {
    const fetchFiles = async () => {
      const newFileList: FileItem[] = [];
      if (dataList?.fileList?.length) {
        for (const item of dataList?.fileList) {
          // 如果有文件，则直接使用该文件的base64数据
          // 否则，调用previewFileApi获取文件的url
          if (item?.originFileObj) {
            const base64Data = await getBase64FormFileObj(item.originFileObj, false);
            newFileList.push({
              id: item.uid,
              name: item?.originFileObj?.name || item.name,
              url: base64Data,
            });
            continue;
          }
          const objectItem = dataList?.objectList.find(obj => obj.id === item.uid);
          if (!objectItem) continue; // 如果没有找到对应的objectItem，则跳过当前文件
          try {
            const res = await previewFileApi({
              fileId: item.uid,
            });
            newFileList.push({
              id: item.uid,
              name: item.uid,
              url: res.url,
            });
          } catch (e) {
            console.error('Error fetching images:', e);
          }
        }
        setFileList(newFileList);
        return;
      }
      if (dataList?.objectList?.length) {
        for (const item of dataList?.objectList) {
          newFileList.push({
            id: item.id || "",
            name: item.id || "",
            url: item.objectId,
          });
        }
        setFileList(newFileList);
        return;
      }
      setFileList([]);
    }
    fetchFiles();
  }, [dataList?.objectList, dataList?.fileList]);

  if (!fileList || fileList.length === 0) {
    return null;
  }

  return (
    <Flex gap={16} className={classNames(styles.objectList, className)} wrap>
      {fileList?.map((fileObj, index) => (
        <div key={index} className={classNames(styles.fileItem)}>
          <MediaPreview
            className={styles.filemWrapper}
            key={index + "preview"}
            href={fileObj?.url}
          />
          <div className={styles.fileItemTitle} title={getFileOrDirName(fileObj)}>{getFileOrDirName(fileObj)}</div>
          <Button
            key={index + "delete"}
            type="link"
            title="删除文件"
            icon={<CloseOutlined />}
            className={styles.deleteBtn}
            danger
            onClick={() => handleDelete(fileObj.id)}
          />
        </div>
      ))}
    </Flex>
  );
};

export default FileListPanel;
