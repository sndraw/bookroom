#!/bin/sh

# 获取变量值
MINIO_ROOT_USER=${MINIO_ROOT_USER:-minioadmin}
MINIO_ROOT_PASSWORD=${MINIO_ROOT_PASSWORD:-minioadmin}
MINIO_ALIAS=${MINIO_ALIAS:-bookroom-minio}
MINIO_WEBUI_PORT=${MINIO_WEBUI_PORT:-9001}
MINIO_REGION=${MINIO_REGION:-ap-southeast-1}
MINIO_POLICY_FILE=${MINIO_POLICY_FILE:-/etc/minio/init/policy.json}
MINIO_POLICY=${MINIO_POLICY:-bookroom-policy}
MINIO_BUCKET_NAME=${MINIO_BUCKET_NAME:-bookroom}

# 启动 MinIO 服务器
echo "Setup MinIO server...${MINIO_WEBUI_PORT}"

 # 配置别名
mc alias set ${MINIO_ALIAS} http://localhost:${MINIO_WEBUI_PORT}
echo "MinIO set alias ${MINIO_ALIAS} http://localhost:${MINIO_WEBUI_PORT}"
# 设置 REGION
mc admin config set ${MINIO_ALIAS} server region ${MINIO_REGION}}
echo "MinIO set region ${MINIO_REGION}"

mc admin policy create ${MINIO_ALIAS} ${MINIO_POLICY} ${MINIO_POLICY_FILE}

echo "MinIO policy created ${MINIO_POLICY}"

mc mb ${MINIO_ALIAS}/${MINIO_BUCKET_NAME}; 
echo "Bucket created ${MINIO_BUCKET_NAME}"

mc anonymous set policy/${MINIO_POLICY} ${MINIO_ALIAS}/${MINIO_BUCKET_NAME}
echo "Anonymous policy set for bucket ${MINIO_BUCKET_NAME}"
mc admin policy set ${MINIO_ALIAS} ${MINIO_POLICY}  user=${MINIO_ROOT_USER} ${MINIO_BUCKET_NAME}/*
echo "Policy set for user ${MINIO_ROOT_USER}"

echo "MinIO setup complete."

minio server /minio_data --console-address ":${MINIO_WEBUI_PORT}"

# 等待 MinIO 服务器启动
sleep 5

echo "MinIO server started."