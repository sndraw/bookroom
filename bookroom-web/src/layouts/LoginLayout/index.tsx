import LogoSite from '@/components/LogoSite';
import { useToken } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { Card, Layout, Spin } from 'antd';
import styles from './index.less';
const { Header, Footer, Content } = Layout;

export type PropsType = {
  children: JSX.Element;
  title: string;
};

const LoginLayout: React.FC<PropsType> = (props: PropsType) => {
  const { title, children } = props;
  const { token } = useToken();
  const { loading } = useModel('globalLoading');
  // const { initialState } = useModel('@@initialState');
  const coryRight = process.env?.UMI_APP_CORYRIGHT;
  return (
    <div
      className={styles.container}
      style={{ backgroundColor: token.colorBgLayout }}
    >
      <Layout className={styles.layout}>
        <Header className={styles.header}>
          <LogoSite className={styles.logo} />
        </Header>
        <Content className={styles.content}>
          <Card className={styles.card} title={title}>
            {children}
          </Card>
        </Content>
        {coryRight && (
          <Footer className={styles.footer}>
            © {new Date().getFullYear()} {coryRight}
          </Footer>
        )}
      </Layout>
      {/* 全局loading */}
      <Spin tip="Loading..." spinning={loading} fullscreen></Spin>
    </div>
  );
};

export default LoginLayout;
