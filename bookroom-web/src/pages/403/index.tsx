import ROUTE_MAP from '@/routers/routeMap';
import { useAuth } from '@/wrappers/auth';
import { Navigate, useModel, useNavigate } from '@umijs/max';
import { Button, Result } from 'antd';
import React from 'react';
const UnAccessiblePage: React.FC<unknown> = () => {
  const navigate = useNavigate();
  const { initialState } = useModel('@@initialState');
  const { isLogin } = useAuth(initialState);

  if (!isLogin) {
    return <Navigate to={ROUTE_MAP.LOGIN} replace={true} />;
  }
  return (
    <Result
      status="403"
      title="403"
      subTitle="抱歉，你无权访问该页面"
      extra={
        <Button
          type="primary"
          onClick={() => {
            navigate(ROUTE_MAP.BASE, { replace: true });
          }}
        >
          返回首页
        </Button>
      }
    />
  );
};

export default UnAccessiblePage;
