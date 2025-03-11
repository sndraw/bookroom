
# 使用说明

## 1.主系统
### 1.1.新建.env文件，用于主系统启动
> 在项目根目录下创建一个名为`.env`的文件，并根据`.env.example`中的示例进行配置。
> `.env`文件中包含了一些环境变量，用于配置数据库、Redis、MinIO等服务。
> MinIO的配置需要根据实际情况进行修改，例如MinIO的端点、秘钥、桶名等，以确保文件上传功能能够正常运行。

### 1.2.启动主系统
> 在项目根目录下运行以下命令来启动服务：
> ```
> docker-compose up -d
> ```

### 2.附属系统（如不需要可以忽略）
### 2.1.新建.env.middleware文件，用于附属系统启动
> 在项目根目录下创建一个名为`.env.middleware`的文件，并根据`.env.middleware.example`中的示例进行配置。
> `.env.middleware`文件中包含了一些环境变量，用于配置附属系统的服务，如LightRAG、MinIO、Ollama等。

### 2.2.启动附属系统
> 在项目根目录下运行以下命令来启动服务：
> ```
> docker compose -f docker-compose.middleware.yaml --env-file .env.middleware up -d
> ```
