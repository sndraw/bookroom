// 运行时配置

// 全局初始化数据配置，用于 Layout 用户信息和权限初始化
// 更多信息见文档：https://umijs.org/docs/api/runtime-config#getinitialstate

import HeaderAvatar from '@/components/HeaderAvatar';
import Page403 from '@/pages/403';
import Page404 from '@/pages/404';
import { fetchInitialData } from '@/services/common/initial';
import { message, theme } from 'antd';
import RequestConfig from './common/request';
import menuConf from './config/menu.conf';
import tokenConf from './config/token.conf';
import { ERROR_CODE_ENUM } from './services/enum';
import { clearToken } from './utils/authToken';
import { RuntimeAntdConfig, RunTimeLayoutConfig } from '@umijs/max';
import antdThemeConf from './config/antd-theme.conf';
// request拦截器
export const request = { ...RequestConfig };


export const antd: RuntimeAntdConfig = (memo: any) => {
  memo.theme ??= {
    ...antdThemeConf
  };
  memo.theme.algorithm = localStorage.getItem('theme') === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm;
  return memo;
};
export const layout: RunTimeLayoutConfig = (props: any) => {

  return {
    title:
      (process.env?.UMI_APP_TITLE || 'AI') +
      (process.env.UMI_APP_MOCK ? '-mock环境' : ''),
    logo: process.env?.UMI_APP_LOGO_URL || "./logo.png",
    layout: 'side',
    // fixSiderbar: true,
    // fixedHeader: true,
    // splitMenus: true,
    contentWidth: 'Fluid',
    suppressSiderWhenMenuEmpty: true,
    siderWidth: 208, // 左侧菜单默认展开时的宽度
    contentStyle: {
      padding: 0,
    },
    menu: menuConf,
    token: tokenConf,
    avatarProps: HeaderAvatar(),
    // menuHeaderRender: () => {
    //   return <LogoSite />;
    // },
    unAccessible: <Page403 />,
    // 自定义 404 页面
    noFound: <Page404 />,
  };
};

// 获取初始化数据
export async function getInitialState() {
  let initialState: API.InitialDataVO = {
    notInited: true,
  };
  // 请求初始化接口,忽略通用错误处理
  await fetchInitialData({}, { skipErrorHandler: true })
    .then((res) => {
      // 有数据返回
      if (res?.data) {
        initialState = res?.data;
        return;
      }
      return Promise.reject(res);
    })
    .catch((err) => {
      // 自定义错误||服务器错误
      const errInfo = err?.info || err?.data;
      // 未安装/未初始化
      if (errInfo?.code === ERROR_CODE_ENUM?.NOT_SETUP) {
        initialState = {
          notSetup: true,
          errorMessage: err?.data?.message,
        };
        clearToken();
        return initialState;
      }
      if (errInfo?.code) {
        initialState = {
          errorMessage: err?.data?.message || '初始化数据失败',
        };
        return initialState;
      }
      message.error('初始化数据失败');
    });
  return initialState;
}
