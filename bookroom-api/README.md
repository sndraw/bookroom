# BookRoom API

BookRoom项目的后端API服务。

## 技术栈

- **Node.js**: >=20.11
- **TypeScript**: 5.x
- **Koa**: Web框架
- **Sequelize**: ORM框架
- **Neo4j**: 图数据库
- **MySQL/PostgreSQL**: 关系型数据库
- **MinIO**: 对象存储
- **Redis**: 缓存和会话存储

## 开发指南

### 环境设置

1. 安装依赖：
```bash
pnpm install
```

2. 创建并配置环境变量文件：
```bash
cp .env.example .env.local
# 编辑 .env.local 文件，设置必要的环境变量
```

3. 启动开发服务器：
```bash
pnpm dev
```

## 测试

### 单元测试

运行单元测试：
```bash
pnpm test
```

### 工具测试脚本

为了验证特定功能，我们提供了一些测试脚本：

1. **Tavily搜索测试**：验证Tavily API调用和响应处理
```bash
# 首先在.env.test文件中配置你的TAVILY_API_KEY
cp .env.test.example .env.test  # 如果没有配置过
# 编辑.env.test添加正确的API密钥

# 运行测试
ts-node test/tavily_verify.ts
```

2. **工具调用流程测试**：验证完整的工具调用链
```bash
# 确保在.env.test中同时配置了TAVILY_API_KEY和OPENAI_API_KEY
# 运行测试
ts-node test/tool_call_verify.ts
```

这些测试脚本有助于排查API集成问题，特别是在大型模型工具调用出现异常时。

## API文档

API文档可以通过以下方式访问：

1. 开发服务器启动后，访问 http://localhost:5001/api/v1/docs
2. 或查看 `docs/api` 目录中的Markdown文档

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