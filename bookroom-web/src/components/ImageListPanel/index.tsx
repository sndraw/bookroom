import { Button, Flex, Image } from 'antd';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import styles from './index.less';
import { previewFileApi } from '@/services/common/file';
import { CloseOutlined } from '@ant-design/icons';
import { getBase64FormFileObj, ImageListType } from '../ImageUpload';

// 添加props类型
interface ImageListProps {
  title?: string;
  imageList?: ImageListType; // 图片列表
  setImageList: React.Dispatch<React.SetStateAction<ImageListType | undefined>>; // 设置图片列表
  className?: string;
}
type FileItem = {
  uid: string;
  url: string;
};
const ImageListPanel: React.FC<ImageListProps> = (props) => {
  const { title, className, imageList, setImageList } = props;
  const [fileList, setFileList] = React.useState<FileItem[]>([])

  // 删除图片的逻辑
  const handleDelete = async (uid: string) => {
    // 查询是否包含该id的file
    const objectItem = imageList?.objectList.find(item => item.fileId === uid);
    if (objectItem) {
      const newObjectIdList = imageList?.objectList.filter(item => item.objectId !== objectItem.objectId) || [];
      const newFileList = imageList?.fileList?.filter(item => item.uid !== objectItem.fileId) || [];
      setImageList({
        objectList: newObjectIdList,
        fileList: newFileList,
      });
    }

  };
  useEffect(() => {
    const fetchFiles = async () => {
      const newFileList: FileItem[] = [];
      if (imageList?.fileList?.length) {
        for (const item of imageList?.fileList) {
          // 如果有文件，则直接使用该文件的base64数据
          // 否则，调用previewFileApi获取图片的url
          if (item?.originFileObj) {
            const base64Data = await getBase64FormFileObj(item.originFileObj, false);
            newFileList.push({
              uid: item.uid,
              url: base64Data,
            });
            continue;
          }
          const objectItem = imageList?.objectList.find(obj => obj.fileId === item.uid);
          if (!objectItem) continue; // 如果没有找到对应的objectItem，则跳过当前文件
          try {
            const res = await previewFileApi({
              fileId: item.uid,
            });
            newFileList.push({
              uid: item.uid,
              url: res.url,
            });
          } catch (e) {
            console.error('Error fetching images:', e);
          }
        }
      }

      setFileList(newFileList);
    }
    fetchFiles();
  }, [imageList?.fileList]);

  if (!fileList || fileList.length === 0) {
    return null;
  }
  return (
    <Flex gap={16} className={classNames(styles.objectList, className)} wrap>
      <Image.PreviewGroup>
        {fileList?.map((fileObj, index) => (
          <div key={index} className={classNames(styles.imageItemWrapper)}>
            <Image
              key={index}
              className={styles.imageItem}
              alt={fileObj?.uid}
              src={fileObj?.url}
              preview={false}
            />
            <Button
              type="link"
              title="删除图片"
              icon={<CloseOutlined />}
              className={styles.deleteBtn}
              danger
              onClick={() => handleDelete(fileObj.uid)}
            />
          </div>
        ))}
      </Image.PreviewGroup>
    </Flex>
  );
};

export default ImageListPanel;
