import { Flex, Image } from 'antd';
import classNames from 'classnames';
import React from 'react';
import styles from './index.less';

// 添加props类型
interface ImageListProps {
  title?: string;
  fileList: any[];
  className?: string;
}

const ImageList: React.FC<ImageListProps> = (props) => {
  const { title, className, fileList } = props;

  if (!fileList || fileList.length === 0) {
    return null;
  }
  return (
    <Flex gap={16} className={classNames(styles.imageList, className)} wrap>
      <Image.PreviewGroup>
        {fileList?.map((file, index) => (
          <div key={index} className={classNames(styles.imageItemWrapper)}>
            <Image
              width={100}
              key={index}
              className={styles.imageItem}
              alt={`image-${index}`}
              src={file?.previewUrl || file?.originFileObj}
              preview={true}
            />
          </div>
        ))}
      </Image.PreviewGroup>
    </Flex>
  );
};

export default ImageList;
