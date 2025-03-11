# 使用 Node.js 官方基础镜像进行构建
FROM node:22 AS builder
WORKDIR /app


# 删除其他源配置文件
RUN rm -rf /etc/apt/sources.list.d/*
# 复制自定义镜像源文件
COPY ./docker/sources.list /etc/apt/sources.list
# 安装 Nginx
RUN apt-get update && apt-get install -y nginx

# 安装依赖
RUN npm config set registry https://registry.npmmirror.com
# RUN npm config set registry https://registry.npm.taobao.org
# 复制项目文件到工作目录
COPY package.json ./package.json

RUN npm install -g pnpm
RUN pnpm install

# 复制项目文件到工作目录
COPY . .
# 修改env.example
RUN cp .env.example .env

# 构建应用
RUN pnpm build

# COPY ./docker/entrypoint.sh /entrypoint.sh
# COPY ./docker/nginx/nginx.conf /etc/nginx/nginx.conf


# 使用 Nginx 镜像作为基础镜像
FROM nginx:1.25.4

# 将 Nginx 的默认配置文件替换为自定义配置文件
COPY ./docker/nginx /etc/nginx

# 从构建阶段复制构建生成的静态文件到 Nginx 用于托管的目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 使用默认的启动命令启动 Nginx（默认 CMD 已经设置在 Nginx 基础镜像中）

COPY ./docker/entrypoint.sh /entrypoint.sh


ENTRYPOINT [ "/bin/bash","/entrypoint.sh" ]
# 声明运行时容器提供服务的端口
EXPOSE 80