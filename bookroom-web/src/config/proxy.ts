import fs from 'fs';
import path from 'path';
// 获取代理配置
export const getProxyOps = () => {
  const proxyMap = new Map();
  if (process.env?.UMI_APP_PROXY_API) {
    proxyMap.set('/api', {
      target: process.env?.UMI_APP_PROXY_API,
      changeOrigin: true,
    });
  }
  // minio代理
  if (process.env?.UMI_APP_PROXY_MINIO_API) {
    proxyMap.set('/oss', {
      target: process.env?.UMI_APP_PROXY_MINIO_API,
      // 转发
      pathRewrite: {
        '^/oss': '',
      },
      changeOrigin: true,
    });
  }

  // 上传文件代理-线上
  if (process.env?.UMI_APP_PROXY_UPLOADS) {
    proxyMap.set('/uploads', {
      target: process.env?.UMI_APP_PROXY_UPLOADS,
      changeOrigin: true,
    });
  } else {
    // 上传文件代理-本地上传
    if (process.env?.UMI_APP_PROXY_UPLOADS_LOCATION) {
      proxyMap.set('/uploads', {
        target: process.env.UMI_APP_PROXY_UPLOADS_LOCATION,
        onProxyReq: function (_proxyReq: any, req: any, res: any) {
          // 验证 URL，防止路径遍历攻击
          const sanitizedPath = path.normalize(
            path.join(
              process.env.UMI_APP_PROXY_UPLOADS_LOCATION || '',
              req.url,
            ),
          );
          // 检查文件是否存在
          try {
            if (!fs.existsSync(sanitizedPath)) {
              res.statusCode = 404;
              res.end('File not found');
              return;
            }
          } catch (error) {
            res.statusCode = 500;
            res.end('Internal server error');
            console.error('Error checking file existence:', error);
            return;
          }
          const _content = fs.readFileSync(sanitizedPath, 'binary');
          res.body = _content;
          res.write(_content, 'binary');
          res.end();
        },
      });
    }
  }

  return Object.fromEntries(proxyMap);
};
