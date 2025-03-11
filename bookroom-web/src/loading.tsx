import { Spin } from 'antd';
import styles from './loading.less';
const LoadingPage: React.FC = () => {
  return (
    <div className={styles?.container}>
      <Spin tip="Loading..." size="large">
        <div className="content" />
      </Spin>
    </div>
  );
};

export default LoadingPage;
