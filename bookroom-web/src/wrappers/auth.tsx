import ServerErrorPage from '@/pages/500';
import ROUTE_MAP from '@/routers/routeMap';
import { clearCache, clearToken, getToken } from '@/utils/authToken';
import { Navigate, Outlet, useLocation, useModel } from '@umijs/max';
// 用户鉴权
export function useAuth(props: any): {
  authError?: boolean;
  isLogin?: boolean;
  notSetup?: boolean;
} {
  // 如果未能加载数据，判定鉴权失败
  if (props?.notInited) {
    return {
      authError: true,
    };
  }
  const notSetup = props?.notSetup;
  const tokenStr = getToken();
  const isLogin = tokenStr && props?.username;
  return {
    isLogin,
    notSetup,
  };
}

export default () => {
  const { initialState } = useModel('@@initialState');
  const { authError, isLogin, notSetup } = useAuth(initialState);
  const location = useLocation();
  // 鉴权失败显示错误页面
  if (authError) {
    return <ServerErrorPage />;
  }
  // 如果未初始化，进入安装页面
  if (notSetup) {
    //  删除当前登录token，防止干扰安装流程
    clearToken();
    // 清理缓存，防止干扰安装流程
    clearCache();
    // 如果当前页面是安装页面，正常显示
    if (location?.pathname === ROUTE_MAP.SETUP) {
      return <Outlet />;
    }
    return <Navigate to={ROUTE_MAP.SETUP} replace={true} />;
  }
  // 如果已经登录，正常显示
  if (isLogin) {
    // 如果当前页面是登录页面，跳转首页
    if (location?.pathname === ROUTE_MAP.LOGIN) {
      return <Navigate to={ROUTE_MAP.HOME} replace={true} />;
    }
    // 如果当前页面是注册页面，跳转首页
    if (location?.pathname === ROUTE_MAP.REGISTER) {
      return <Navigate to={ROUTE_MAP.HOME} replace={true} />;
    }
    // 如果当前页面是安装页面，跳转首页
    if (location?.pathname === ROUTE_MAP.SETUP) {
      return <Navigate to={ROUTE_MAP.HOME} replace={true} />;
    }
    return <Outlet />;
  } else {
    // 如果当前页面是登录页面，正常显示
    if (location?.pathname === ROUTE_MAP.LOGIN) {
      return <Outlet />;
    }
    // 如果当前页面是注册页面，正常显示
    if (location?.pathname === ROUTE_MAP.REGISTER) {
      return <Outlet />;
    }
    // 如果当前页面是用户协议页面，正常显示
    if (location?.pathname === ROUTE_MAP.AGREEMENT) {
      return <Outlet />;
    }
    // 如果未登录，跳转到登录页面
    return <Navigate to={ROUTE_MAP.LOGIN} replace={true} />;
  }
};
