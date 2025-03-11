import { Outlet, useModel } from '@umijs/max';
import { Spin } from 'antd';
const BasicLayout: React.FC = () => {
  const { loading } = useModel('globalLoading');
  return (
    <>
      <Outlet />
      {/* 全局loading */}
      <Spin tip="Loading..." spinning={loading} fullscreen></Spin>
    </>
  );
};

export default BasicLayout;
