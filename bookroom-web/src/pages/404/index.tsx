import ROUTE_MAP from '@/routers/routeMap';
import { useNavigate } from '@umijs/max';
import { Button, Result } from 'antd';
import React from 'react';
type ServerErrorProps = {
  title?: string;
  isButton?: boolean;
};

const NotFoundPage: React.FC<ServerErrorProps> = (props) => {
  const navigate = useNavigate();
  const { title = '抱歉，该页面不存在', isButton = true } = props;

  return (
    <Result
      status="404"
      title="404"
      subTitle={title}
      extra={
        isButton && (
          <Button
            type="primary"
            onClick={() => {
              navigate(ROUTE_MAP.BASE, { replace: true });
            }}
          >
            返回首页
          </Button>
        )
      }
    />
  );
};

export default NotFoundPage;
