// import AvatarImg from '@/assets/avatar.jpg';
import ROUTE_MAP from '@/routers/routeMap';
import { logout } from '@/services/user/userInfo';
import { clearToken } from '@/utils/authToken';
import { LockOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useToken } from '@ant-design/pro-components';
import { Link, useModel, useNavigate } from '@umijs/max';
import { Dropdown } from 'antd';
import ThemeSwitch from '../Theme/ThemeSwitch';
// import styles from './index.less';

const HeaderAvatar = () => {
  const { initialState } = useModel('@@initialState');
  const { showLoading, hideLoading } = useModel('globalLoading');
  // 登出操作
  const logoutHandle = async () => {
    try {
      showLoading();
      // 调用登出接口
      await logout({
        skipErrorHandler: true,
      });
      // 清理token
      clearToken();
      // 重新刷新页面
      window.location.reload();
    } finally {
      hideLoading();
    }
  };
  const navigate = useNavigate();
  // 主题样式
  const { token } = useToken();
  return {
    src: (
      <UserOutlined
        style={{
          color: token.colorTextDescription,
        }}
      />
    ),
    style: {
      // width: 24,
      // height: 24,
      fontSize: 20,
    },
    title: (
      <div
        style={{
          color: token.colorTextDescription,
        }}
      >
        {initialState?.username || '未登录'}
      </div>
    ),
    render: (props: any, dom: any) => {
      if (!initialState?.username) {
        return (
          <Link to={ROUTE_MAP.LOGIN} replace={true}>
            点击登录
          </Link>
        );
      }
      return (
        <>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'pwdChange',
                  icon: <LockOutlined />,
                  label: '密码修改',
                  onClick: async () => {
                    navigate(ROUTE_MAP.PWD_CHANGE, { replace: true });
                  },
                },
                {
                  key: 'logout',
                  icon: <LogoutOutlined />,
                  label: '退出登录',
                  onClick: () => {
                    // 调用登录接口
                    logoutHandle();
                  },
                },
              ],
            }}
          >
            {dom}
          </Dropdown>
          <ThemeSwitch />
        </>
      );
    },
  };
};
export default HeaderAvatar;
