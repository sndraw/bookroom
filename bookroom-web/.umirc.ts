import { defineConfig } from '@umijs/max';
import antd from './src/config/antd';
import layout from './src/config/layout';
import { getProxyOps } from './src/config/proxy';
import theme from './src/config/theme';
import routes from './src/routers/routes';

export default defineConfig({
  hash: true,
  title:
    (process.env.UMI_APP_TITLE || 'AI') +
    (process.env.UMI_APP_MOCK ? '-mock环境' : ''),
  favicons: [process.env.UMI_APP_FAVICON_URL || './favicon.ico'],
  history: { type: process.env?.UMI_APP_HISTORY_HASH ? 'hash' : 'browser' },
  base: process.env.UMI_APP_BASENAME || '/',
  publicPath:
    process.env?.NODE_ENV === 'development'
      ? '/'

      : process.env?.UMI_APP_PUBLIC_PATH || './',
  antd,
  layout,
  theme,
  routes,
  request: {},
  access: {},
  model: {},
  initialState: {},
  npmClient: 'pnpm',
  mock: process.env?.UMI_APP_MOCK ? {} : false,
  proxy: getProxyOps(),
  esbuildMinifyIIFE: process.env.NODE_ENV === 'development' ? false : true,
  jsMinifier: process.env?.NODE_ENV === 'development' ? 'none' : 'esbuild',
  devtool: process.env.NODE_ENV === 'development' ? 'source-map' : false,
});
