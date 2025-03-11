import { PageContainer } from '@ant-design/pro-components';
import { useRouteData } from '@umijs/max';

import React from 'react';
import styles from './index.less';

export type PropsType = {
  children: JSX.Element;
  title?: string | boolean;
  breadcrumb?: boolean;
};
// 脚手架示例组件
const DefaultLayout: React.FC<PropsType> = (props: PropsType) => {
  const { title = false, children } = props;
  const routeData = useRouteData();
  const { route } = routeData;
  /* @ts-ignore */
  let containerTitle = route?.name || '';
  if (title === false) {
    containerTitle = false;
  }
  return (
    <PageContainer
      className={styles?.page}
      ghost
      header={{
        title: title,
      }}
    >
      {children}
    </PageContainer>
  );
};

export default DefaultLayout;
