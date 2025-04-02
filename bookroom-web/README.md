# 部署文档

## 开发环境

### 1、新建 .env 文件并配置环境变量（如果部署时使用预设环境变量，请忽略该步骤）
**示例文件**：`.env.expample`
````bash
# 复制 .env.expample 并修改为本地 .env 文件，以下为部分配置示例：
# API接口-代理地址, 用于开发环境代理请求到后端服务
UMI_APP_PROXY_API=http://localhost:5001
```

### 2.安装全局依赖
```bash
npm config set registry https://registry.npmmirror.com

npm install pnpm -g
```

### 3.进入项目根目录，安装项目依赖

```bash
pnpm install
```

### 4.执行命令

```bash
pnpm dev
```

## 生产环境

### 1. 配置.env

```bash
UMI_APP_PROXY_API=
```

### 2. 执行命令

```bash
pnpm build
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
make build-push-all REGISTRY_URL=<IP:port>/<repository> IMAGE_NAME=sndraw/bookroom-web IMAGE_VERISON=1.0.0
```


# 开发文档

[Umi Max 简介](https://umijs.org/docs/max/introduce)
