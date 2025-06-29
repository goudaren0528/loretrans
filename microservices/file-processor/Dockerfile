# 使用官方 Node.js 18 镜像
FROM node:18-slim

# 设置工作目录
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 复制 package 文件
COPY package*.json ./

# 安装 Node.js 依赖
RUN npm ci --only=production

# 创建必要的目录
RUN mkdir -p uploads temp results logs

# 复制源代码
COPY src/ ./src/

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=8081
ENV HOST=0.0.0.0
ENV LOG_LEVEL=info

# 暴露端口
EXPOSE 8081

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD curl -f http://localhost:8081/health || exit 1

# 启动服务
CMD ["npm", "start"] 