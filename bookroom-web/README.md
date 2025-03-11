# 部署文档

## 开发环境

### 1、新建 env 文件并配置环境变量（如果部署时使用预设环境变量，请忽略该步骤）
**示例文件**：`.env.expample`

**示例如下（拷贝示例文件并修改为本地 env 文件）**  
本地 env 文件：`.env.local`
```
# API接口-代理地址
UMI_APP_PROXY_API=http://localhost:5001
# MINIO接口-代理地址
UMI_APP_PROXY_MINIO_API=http://localhost:19000
```

### 2.安装全局依赖
```
npm config set registry https://registry.npmmirror.com

npm install pnpm -g
```

### 3.进入项目根目录，安装项目依赖

```
pnpm install
```

### 4.执行命令

```
pnpm dev
```

## 生产环境

### 1. 配置.env

```
UMI_APP_PROXY_API=
```

### 2. 执行命令

```
pnpm build
```

# Docker打包
### 1.登录镜像仓库（可选）
```
docker login -u username <IP:port>/<repository>
```
### 2.构建镜像

#### make命令（参数可选）
注：Makefile中定义了build-push-all目标，可以一次性构建并推送镜像

```
make build-push-all REGISTRY_URL=<IP:port>/<repository> IMAGE_NAME=bookroom-api IMAGE_VERISON=1.0.0
```


# 开发文档

[Umi Max 简介](https://umijs.org/docs/max/introduce)
