import LoginLayout from '@/layouts/LoginLayout';
import AgreementPage from '@/pages/Agreement';
import ROUTE_MAP from '@/routers/routeMap';
import { fetchInitialData } from '@/services/common/initial';
import { login } from '@/services/common/login';
import { setToken } from '@/utils/authToken';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { Link, useModel, useNavigate } from '@umijs/max';
import { Modal } from 'antd';
import { MD5 } from 'crypto-js';
import styles from './index.less';

const LoginPage: React.FC = () => {
  const { loading, showLoading, hideLoading } = useModel('globalLoading');

  const { initialState, setInitialState } = useModel('@@initialState');
  // const { siteInfo = {} } = initialState || {};
  const [modal, contextHolder] = Modal.useModal();
  const navigate = useNavigate();
  const onFinish: (formData: API.LoginInfo) => Promise<boolean | void> = async (
    formData,
  ) => {
    if (!formData) {
      return false;
    }
    // 密码加密
    const encryptedPassword = MD5(formData.password).toString();
    try {
      showLoading();
      // 登录
      const tokenObj = await login({
        ...formData,
        password: encryptedPassword,
      }).then((res: any) => {
        if (res?.data) {
          return res?.data;
        }
      });
      if (!tokenObj?.access_token) {
        return false;
      }

      setToken(tokenObj);

      // 获取初始化配置
      const initialData = await fetchInitialData().then((res) => {
        if (res?.data) {
          return res.data;
        }
      });

      if (!initialData) {
        return false;
      }
      // 保存初始化设置
      setInitialState({
        ...initialData,
      });
      // 延迟跳转，防止异步获取数据失败，跳转回当前页面
      setTimeout(() => {
        navigate(ROUTE_MAP.HOME, { replace: true });
      }, 100);
      return true;
    } catch (error) {
      return false;
    } finally {
      hideLoading();
    }
  };

  // const onFinishFailed = (error: any) => {
  //   message.error(error?.message);
  // };

  return (
    <LoginLayout title="登录">
      <LoginForm
        name="basic"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        logo={false}
        title={process.env.UMI_APP_TITLE}
        subTitle={process.env.UMI_APP_SUB_TITLE}
        actions={
          <div className={styles.tool}>
            {/* <ProFormCheckbox noStyle name="remember" valuePropName="checked">
              记住我
            </ProFormCheckbox> */}
            <Link className={styles.register} to={ROUTE_MAP.REGISTER}>
              注册账号
            </Link>
          </div>
        }
        loading={loading}
        disabled={loading}
      >
        <ProFormText
          name="username"
          fieldProps={{
            size: 'large',
            prefix: <UserOutlined className={'prefixIcon'} />,
            tabIndex: 1, // 设置 Tab 键顺序
          }}
          placeholder={'用户名'}
          rules={[
            {
              required: true,
              message: '请输入用户名',
            },
          ]}
        />
        <ProFormText.Password
          name="password"
          fieldProps={{
            size: 'large',
            prefix: <LockOutlined className={'prefixIcon'} />,
            tabIndex: 2, // 设置 Tab 键顺序
          }}
          placeholder={'密码'}
          rules={[
            {
              required: true,
              message: '请输入密码',
            },
          ]}
        />
        <div className={styles.agreement}>
          <span>登录即视为您已阅读并同意</span>
          {/* <Link to={ROUTE_MAP.AGREEMENT} target="_blank">
            用户协议
          </Link> */}
          {contextHolder}
          <a
            onClick={(event) => {
              event?.stopPropagation?.();
              event?.preventDefault?.();
              modal.info({
                width: 800,
                title: '用户协议',
                content: (
                  <div className={styles.agreementContent}>
                    <AgreementPage />
                  </div>
                ),
                okText: '确定',
                closable: true,
              });
            }}
          >
            用户协议
          </a>
        </div>
      </LoginForm>
    </LoginLayout>
  );
};

export default LoginPage;
