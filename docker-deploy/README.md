
# 使用说明

## 1.主系统
### 1.1.新建.env文件，用于主系统启动
- 在项目部署目录下创建一个名为`.env`的文件，并根据`.env.example`中的示例进行配置。
- `.env`文件中包含了一些环境变量，用于配置数据库、Redis、MinIO等服务。
- MinIO的配置需要根据实际情况进行修改，例如MinIO的端点、秘钥、桶名等，以确保文件上传功能能够正常运行。

### 1.2.启动主系统
- 在项目部署目录下运行以下命令来启动服务：
```
docker compose up -d
```
- 如果需要多.env文件，请在命令中指定相应的.env文件路径，例如：
```bash
docker compose --env-file .env.local up -d
```
- 访问主系统的前端页面：http://localhost:20080
- 访问主系统的API接口：http://localhost:25001/api/v1
- 访问MinIO的管理界面：http://localhost:29001

### 1.3.停止主系统
- 在项目根目录下运行以下命令来停止服务：
```bash
docker compose down
```
### 1.4.迁移数据库
- 请使用以下命令备份数据库：
```bash
# 进入容器并备份数据库
docker exec -it docker-deploy-bookroom_mysql-1 bash
mysqldump -u root -p bookroom_api > /backup.sql
# 输入密码后执行备份操作
password: your_password
# 退出
exit
# 复制备份文件到宿主机
docker cp docker-deploy-bookroom_mysql-1:/backup.sql ./backup.sql
```
### 1.5.恢复数据库
- 如果需要恢复数据库，请使用以下命令：
```bash
# 复制备份文件到容器中
docker cp ./backup.sql docker-deploy-bookroom_mysql-1:/backup.sql
# 进入容器并恢复数据库
docker exec -it docker-deploy-bookroom_mysql-1 bash
mysql -u root -p bookroom_api < /backup.sql
# 输入密码后执行恢复操作
password: your_password
# 退出
exit

```
### 1.6.数据库同步
- 如果需要同步数据库，请在`.env`文件中设置数据库同步模式：
```bash
# 数据库同步表结构，开发环境推荐使用，不会删除数据（生产环境建议关闭）
DB_SYNC_ALTER=true
# 数据库强制同步，不推荐使用，会删除所有数据并重新创建表结构
DB_SYNC_FORCE=
```
- 运行以下命令：
```bash
docker compose up -d --build bookroom-api
```

### 2.附属系统（如不需要可以忽略）
### 2.1.新建.env.middleware文件，用于附属系统启动
- 在项目部署目录下创建一个名为`.env.middleware`的文件，并根据`.env.middleware.example`中的示例进行配置。
- `.env.middleware`文件中包含了一些环境变量，用于配置附属系统的服务，如LightRAG、MinIO、Ollama等。

### 2.2.启动附属系统
- 在项目部署目录下运行以下命令来启动服务：
```bash
docker compose -f docker-compose.middleware.yaml --env-file .env.middleware up -d
```
### 1.3.停止附属系统
- 在项目部署目录下运行以下命令来停止服务：
```bash
docker compose -f docker-compose.middleware.yaml --env-file .env.middleware down
```

