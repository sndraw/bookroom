# MinIO配置指南
‌‌在MinIO中创建桶和策略的具体步骤如下‌：

## 1.登录MinIO控制台‌：
使用管理员账户登录MinIO控制台。
```bash
# 本地启动MinIO服务器
前端地址：http://localhost:9001
API地址：http://localhost:9000
# Docker启动MinIO服务器
前端地址：http://<ip>:<映射端口>
API地址：http://<ip>:<映射端口>
```

## 2.创建桶‌：
- 在左侧菜单中，点击“Buckets”（桶）。
- 点击“Create Bucket”（创建桶）按钮。
- 输入桶名称（如bookroom），并设置其他选项，然后点击“Create”（创建）按钮。

## ‌3.创建策略‌：
- 在左侧菜单中，点击“Policies”（策略）。
- 点击“Create Policy”（创建策略）按钮。
- 输入策略名称（如bookroom-policy），并在编辑框中输入以下JSON策略：

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:DeleteObject",
                "s3:GetObject",
                "s3:ListBucket",
                "s3:PutObject"
            ],
            "Resource": [
                "arn:aws:s3:::bookroom/*"
            ]
        }
    ]
}
```
点击“Save”（保存）来创建策略。

## 4.‌创建用户并分配策略‌：
- 在左侧菜单中，展开“Identity”部分，点击“Users”（用户）。
- 如果已有用户，点击该用户进行编辑；如果没有，点击“Create User”（创建用户），输入用户名和密码，并点击“Save”（保存）。
- 在用户详情页，点击“Assign Policies”（分配策略），选择已创建的bookroom-policy策略，然后点击“Save”（保存）。
- 验证用户权限‌：用户将只能访问bookroom桶，无法访问其他桶。可以让用户登录控制台并尝试访问其他桶，验证权限是否正确‌

## 4.‌为用户添加秘钥：
- 在用户详情页Service Accounts部分，点击“Access Keys”（访问密钥），然后点击“Create Access Key”（创建访问密钥）。
- 系统会生成一对访问密钥和秘密密钥。请妥善保存这些密钥，因为它们将用于访问MinIO服务。

## 5.配置服务器位置：
- 在左侧菜单中，点击“Configuration”（配置）。 
- 在“Region”（区域）的“Server Location”(服务器位置)字段中输入`ap-southeast-1`。点击“Save”（保存）。

## 6. 将MinIO配置到Docker Compose中
在`.env`文件中添加MinIO服务的配置。示例如下：
```yml
# minio
MINIO_ENDPOINT=<IP地址或域名>
MINIO_PORT=<端口号>
MINIO_ACCESS_KEY=<Access KEY>
MINIO_SECRET_KEY=<Secret KEY>
MINIO_BUCKET_NAME=<桶名称>
MINIO_REGION=ap-southeast-1
MINIO_USE_SSL=false
```
重启Docker Compose以应用更改：
```
docker-compose up -d
```


# 注意事项
1. 在配置MinIO时，请确保使用正确的访问密钥和秘密密钥，并且桶名称和区域设置正确。如果需要启用SSL，请将`MINIO_USE_SSL`设置为`true`，并提供相应的SSL证书和密钥。
2. 因为MinIO服务不支持子路径，所以请确保在配置MinIO时不要使用子路径，也不要代理到子路径。
3. 如果要给MinIO添加自定义域名，请确保在配置MinIO时提供正确的自定义域名，并且在DNS中正确解析该域名。
4. 如果要使用自定义域名，注意修改`.env`文件的`MINIO_ENDPOINT`、`MINIO_PORT`和`MINIO_USE_SSL`等字段。



