# 使用 Node.js 官方基础镜像进行构建

FROM  node:22 AS base


FROM  base AS builder
WORKDIR /app


# 复制项目文件到工作目录
COPY package.json ./package.json

RUN npm install -g pnpm

RUN npm install ts-node -g

RUN pnpm install

# 复制项目文件到工作目录
COPY . .

RUN pnpm build

FROM  base AS production

WORKDIR /app

RUN npm install pm2 -g

COPY --from=builder /app/dist /app/dist
COPY --from=builder /app/pm2.config.js /app/pm2.config.js
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/pnpm-lock.yaml /app/pnpm-lock.yaml

# RUN npm install --omit=dev --legacy-peer-deps
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile --prod

COPY ./docker/entrypoint.sh /entrypoint.sh

ENTRYPOINT [ "/bin/bash","/entrypoint.sh" ]

# 声明运行时容器提供服务的端口
EXPOSE 5001