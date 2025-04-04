## 项目架构

- 开发语言：Node.js(v22.12.0+)、Typescript(v5.0.0+)
- 基本架构：koa2、mysql、redis、minio
- 运行环境：nodemon、pm2

## 使用说明

### 1、新建数据库、redis、minio

- 在数据库中新建数据库bookroom_api
- 根据实际需要添加数据（后续将对敏感信息加密后再存入数据库）

### 2、新建 env 文件并配置环境变量（如果部署时使用预设环境变量，请忽略该步骤）
**示例文件**：`.env.expample`
```bash
# 复制 .env.expample 并修改为本地 .env.local 文件，以下为部分配置示例：

SERVER_PORT=5001
SERVER_LOGS_PATH=/logs/bookroom-api
DB_HOST=localhost
DB_PORT=3306
DB_USER=test
DB_PASSWORD=test-key
DB_DATABASE=bookroom_api
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=test
REDIS_DATABASE=bookroom_api
MINIO_ENDPOINT=127.0.0。1
MINIO_PORT=9000
MINIO_ACCESS_KEY=minio
MINIO_SECRET_KEY=minio
MINIO_BUCKET_NAME=bookroom
MINIO_REGION=ap-southeast-1
MINIO_USE_SSL=false
```

### 3、安装全局依赖（本地热部署开发可以忽略该步骤）
```bash
npm config set registry https://registry.npmmirror.com

npm install ts-node -g

npm install pm2 -g

npm install pnpm -g
```
### 4、进入项目根目录，安装项目依赖

`pnpm install`

### 5、运行代码

#### 非 env 文件部署（使用预设环境变量）

`pnpm start`

#### 热部署

`pnpm dev` 

#### pm2 部署

```bash
pnpm build
pnpm deploy
```

#### pm2 移除服务

```bash
pnpm undeploy
```

# Docker打包
### 1.登录镜像仓库（可选）
```bash
docker login -u username <IP:port>/<repository>
```
### 2.构建镜像

#### make命令（参数可选）
注：Makefile中定义了build-push-all目标，可以一次性构建并推送镜像
```bash
make build-push-all REGISTRY_URL=<IP:port>/<repository> IMAGE_NAME=sndraw/bookroom-api IMAGE_VERISON=1.0.0
```