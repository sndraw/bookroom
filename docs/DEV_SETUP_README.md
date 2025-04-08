# BookRoom 本地开发环境搭建指南

本文档详细说明了如何从零开始搭建 BookRoom 项目的本地开发环境，包括所有依赖服务、后端 API 和前端 Web 应用。

## 前置条件

在开始之前，请确保您的系统已安装以下工具：

1. **Git** - 用于克隆仓库和版本控制
2. **Docker 和 Docker Compose** - 用于运行依赖服务（MySQL、Redis、MinIO）
3. **nvm** (Node Version Manager) - 用于管理 Node.js 版本

## 1. 获取代码

```bash
# 克隆仓库
git clone https://github.com/sndraw/bookroom.git
cd bookroom
```

## 2. 安装/配置 Node.js

BookRoom API 要求 Node.js v22.12.0 或更高版本，强烈建议使用 nvm 安装和管理：

```bash
# 安装所需的 Node.js 版本
nvm install 22.12.0

# 切换到该版本
nvm use 22.12.0

# (可选) 设为默认版本
nvm alias default 22.12.0

# 验证 Node.js 版本
node -v  # 应该显示 v22.12.0 或更高
```

## 3. 安装全局依赖

```bash
# 设置 npm 镜像源（可选，但推荐用于加速下载）
npm config set registry https://registry.npmmirror.com

# 全局安装 pnpm
npm install -g pnpm
```

## 4. 配置和启动依赖服务 (Docker)

### 4.1 修改 Docker Compose 配置

BookRoom 项目的 `docker-deploy/docker-compose.yaml` 文件默认为生产部署配置，需要进行修改以用于本地开发：

1. 进入 docker-deploy 目录：
   ```bash
   cd docker-deploy
   ```

2. 备份原始文件（可选但推荐）：
   ```bash
   cp docker-compose.yaml docker-compose.original.yaml
   ```

3. 修改 `docker-compose.yaml` 文件：
   - 移除 `bookroom_api` 和 `bookroom_web` 服务（因为我们将在本地运行它们）
   - 添加 MinIO 服务
   - 将共享网络的 `internal` 设置为 `false`

修改后的 `docker-compose.yaml` 文件应类似于：

```yaml
# 前面的环境变量定义部分保留...

services:
  # The mysql database.
  bookroom_mysql:
    image: mysql:8.0.40
    # MySQL 配置保留...
    ports:
      - "${EXPOSE_DB_PORT:-3306}:${DB_PORT:-3306}"
    # 其他配置保留...

  # The redis cache.
  bookroom_redis:
    image: redis:6-alpine
    # Redis 配置保留...
    command: redis-server --requirepass ${REDIS_PASSWORD:-test}
    healthcheck:
      test: [ "CMD", "redis-cli", "-a", "${REDIS_PASSWORD:-test}", "ping" ]
    ports:
      - "${EXPOSE_REDIS_PORT:-6379}:${REDIS_PORT:-6379}"
    # 其他配置保留...

  # The MinIO object storage.
  bookroom_minio:
    image: minio/minio:latest
    restart: always
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER:-minioadmin}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD:-minioadmin}
    volumes:
      - ./volumes/minio/data:/data
    ports:
      - "${EXPOSE_MINIO_API_PORT:-9000}:9000"
      - "${EXPOSE_MINIO_CONSOLE_PORT:-9001}:9001"
    command: server /data --console-address ":9001"
    networks:
      - bookroom_shared_network
      - default

# 定义共享网络
networks:
  bookroom_shared_network:
    driver: bridge
    internal: false  # 这里必须是 false，否则宿主机无法连接服务
```

### 4.2 配置根目录的 .env 文件

在项目根目录创建 `.env` 文件，用于配置 Docker 容器内服务的环境变量：

```bash
cd ..  # 返回项目根目录
```

创建 `.env` 文件，至少包含以下配置：

```
# 数据库配置
DB_PASSWORD=test
DB_DATABASE=bookroom_api

# Redis 配置
REDIS_PASSWORD=Sai83aTAB-AEAiE878B-Ba736PZQ

# MinIO 配置
EXPOSE_MINIO_API_PORT=9000
EXPOSE_MINIO_CONSOLE_PORT=9001
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=minioadmin

# 端口映射
EXPOSE_DB_PORT=23306
EXPOSE_REDIS_PORT=26379
```

### 4.3 启动依赖服务

返回 `docker-deploy` 目录并启动服务：

```bash
cd docker-deploy
docker compose --env-file ../.env up -d
```

> **重要注意事项：** 
> - 使用 `--env-file ../.env` 参数明确指定根目录下的 `.env` 文件
> - 确认所有服务启动正常：`docker ps`

## 5. 配置并运行后端 API (bookroom-api)

### 5.1 配置 .env.local 文件

```bash
cd ../bookroom-api
```

创建 `.env.local` 文件（从示例复制或创建新的）：

```
# API 配置
SERVER_TITLE=bookroom-api
SERVER_PORT=5001
SERVER_LOGS_PATH=
SERVER_BASE_URL=/api/v1
CORS_ALLOW_ORIGIN=

# 数据库配置 - 连接到 Docker MySQL 容器
DB_DIALECT=mysql
DB_HOST=localhost
DB_PORT=23306
DB_USER=root
DB_PASSWORD=test
DB_DATABASE=bookroom_api
DB_TIMEZONE=+08:00
DB_SYNC=

# Redis 配置 - 连接到 Docker Redis 容器
REDIS_HOST=localhost
REDIS_PORT=26379
REDIS_PASSWORD=Sai83aTAB-AEAiE878B-Ba736PZQ
REDIS_DATABASE=bookroom_api

# Minio 配置 - 连接到 Docker MinIO 容器
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET_NAME=bookroom
MINIO_REGION=ap-southeast-1
MINIO_USE_SSL=false

# 其他配置...（可以从 .env.example 复制）
```

> **注意事项：**
> - 确保 DB_PASSWORD 与根 .env 文件中的 DB_PASSWORD 一致
> - 确保 REDIS_PASSWORD 与根 .env 文件中的 REDIS_PASSWORD 一致
> - 确保 MINIO_ACCESS_KEY 和 MINIO_SECRET_KEY 分别与根 .env 文件中的 MINIO_ROOT_USER 和 MINIO_ROOT_PASSWORD 一致

### 5.2 安装依赖并启动开发服务器

```bash
# 安装项目依赖
pnpm install

# 启动开发服务器（带热重载）
pnpm dev
```

## 6. 配置并运行前端 Web 应用 (bookroom-web)

### 6.1 配置 .env.local 文件

新开一个终端，确保后端服务保持运行：

```bash
cd /path/to/bookroom/bookroom-web
```

创建 `.env.local` 文件：

```
# 本地开发端口
PORT=8000

# API接口-代理地址 (连接到本地运行的后端服务)
UMI_APP_PROXY_API=http://localhost:5001

# MINIO接口-代理地址 (连接到本地Docker的MinIO服务)
UMI_APP_PROXY_MINIO_API=http://localhost:9001

# 其他配置...（可以从 .env.example 复制）
```

### 6.2 安装依赖并启动开发服务器

```bash
# 安装项目依赖
pnpm install

# 启动开发服务器（带热重载）
pnpm dev
```

## 常见问题和解决方案

### 1. 端口冲突

如果您的系统上已经有服务占用了默认端口，您会看到类似于以下的错误：

```
Error response from daemon: driver failed programming external connectivity on endpoint docker-deploy-bookroom_mysql-1: Bind for 0.0.0.0:3306 failed: port is already allocated
```

**解决方案：** 修改项目根目录下的 `.env` 文件中的端口映射：

```
EXPOSE_DB_PORT=23306  # 将 MySQL 映射到 23306 而不是 3306
EXPOSE_REDIS_PORT=26379  # 将 Redis 映射到 26379 而不是 6379
```

### 2. Redis 连接问题

如果应用程序无法连接到 Redis，可能会看到以下错误：

```
redis连接错误: Error: connect ECONNREFUSED
```

**解决方案：** 
1. 确保 Docker Compose 文件中的共享网络 `bookroom_shared_network` 的 `internal` 属性设置为 `false`
2. 确保 Redis 容器正在运行：`docker ps | grep redis`
3. 检查端口映射是否正确：`docker inspect docker-deploy-bookroom_redis-1 | grep PortBindings`
4. 验证 Redis 连接凭据是否正确

### 3. MinIO 配置问题

如果前端无法连接到 MinIO 服务，可能是 `UMI_APP_PROXY_MINIO_API` 配置错误。

**解决方案：** 确保 `.env.local` 中的 `UMI_APP_PROXY_MINIO_API` 指向正确的端口：

```
UMI_APP_PROXY_MINIO_API=http://localhost:9001  # 指向 MinIO 控制台端口
```

### 4. Node.js 版本问题

如果您遇到 Node.js 相关错误，确保您正在使用正确的 Node.js 版本：

```bash
# 检查当前版本
node -v

# 如果版本不是 v22.12.0 或更高，请使用 nvm 切换
nvm use 22.12.0
```

## 接下来的步骤

成功完成环境搭建后，您可以：

1. 访问前端应用：http://localhost:8000 (或您配置的端口)
2. 访问后端 API：http://localhost:5001/api/v1
3. 访问 MinIO 管理控制台：http://localhost:9001 (用户名/密码: minioadmin/minioadmin)

## 贡献代码

请参考 [DEV_START_README.md](./DEV_START_README.md) 获取日常开发流程和代码贡献指南。 