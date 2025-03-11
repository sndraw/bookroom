#!/bin/bash

set -e

# 如果app文件夹不存在
if [ ! -d "/app" ]; then
  # 启动nginx
  nginx -g 'daemon off;'
  exit 1
fi

# 如果不存在dist包，则执行build
if [ ! -d "/app/dist" ]; then
  cd /app
  npm run build
  cp -r /app/dist/* /usr/share/nginx/html/
fi

# 启动nginx
nginx -g 'daemon off;'