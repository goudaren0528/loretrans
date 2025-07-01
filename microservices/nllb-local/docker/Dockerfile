# 使用官方Node.js 18镜像
FROM node:18-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# 复制package文件
COPY package*.json ./

# 安装Node.js依赖（使用 npm install 而不是 npm ci，因为没有 package-lock.json）
RUN npm install --only=production

# 创建必要的目录
RUN mkdir -p models downloads temp logs

# 复制源代码
COPY src/ ./src/
COPY scripts/ ./scripts/

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0
ENV LOG_LEVEL=info

# 下载模型（可选 - 也可以在运行时下载）
# RUN npm run download-model

# 暴露端口
EXPOSE 8080

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# 启动服务
CMD ["npm", "start"] 