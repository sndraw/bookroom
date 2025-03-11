import { Tag } from 'antd';
import { DocStatus } from '../enum';

const DocStatusTag = (props: { status: string }) => {
  const { status } = props;
  if (status === DocStatus.FAILED) {
    return <Tag color="red">失败</Tag>;
  }
  if (status === DocStatus.PROCESSED) {
    return <Tag color="green">成功</Tag>;
  }
  if (status === DocStatus.PROCESSING) {
    return <Tag color="blue">处理中</Tag>;
  }
  if (status === DocStatus.PENDING) {
    return <Tag color="yellow">待处理</Tag>;
  }
  return null;
};

export default DocStatusTag;
