import { Button, Result } from 'antd';
import React from 'react';

type WarningProps = {
  title?: string;
  subTitle?: string;
  isButton?: boolean;
};

const WarningPage: React.FC<WarningProps> = (props) => {
  const { title = '抱歉，服务器错误', subTitle = '', isButton = true } = props;
  return (
    <Result
      status="warning"
      title={title}
      subTitle={subTitle}
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

export default WarningPage;
