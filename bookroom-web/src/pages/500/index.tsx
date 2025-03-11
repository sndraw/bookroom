import { Button, Result } from 'antd';
import React from 'react';

type ServerErrorProps = {
  title?: string;
  isButton?: boolean;
};

const ServerErrorPage: React.FC<ServerErrorProps> = (props) => {
  const { title = '抱歉，服务器错误', isButton = true } = props;
  return (
    <Result
      status="500"
      title="500"
      subTitle={title}
      extra={
        isButton && (
          <Button
            type="primary"
            onClick={() => {
              window.location.reload();
            }}
          >
            刷新页面
          </Button>
        )
      }
    />
  );
};

export default ServerErrorPage;
