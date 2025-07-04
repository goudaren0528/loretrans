# NLLB应用镜像
# 基于模型层，添加Node.js应用代码
ARG ECR_REGISTRY=034986963036.dkr.ecr.ap-southeast-1.amazonaws.com
ARG ECR_REPOSITORY=translation-low-source
FROM ${ECR_REGISTRY}/${ECR_REPOSITORY}:nllb-model-latest

LABEL maintainer="Transly Team"
LABEL description="NLLB Translation Service Application"

# 复制package文件并安装Node.js依赖
COPY package*.json ./
RUN npm install --only=production && \
    npm cache clean --force

# 复制应用源代码
COPY src/ ./src/

# 设置应用环境变量
ENV NODE_ENV=production
ENV PORT=8080
ENV HOST=0.0.0.0
ENV LOG_LEVEL=info

# 性能和缓存配置
ENV MAX_CONCURRENT_REQUESTS=5
ENV REQUEST_TIMEOUT=30000
ENV NODE_OPTIONS=--max-old-space-size=4096

# 暴露端口
EXPOSE $PORT

# 应用健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:$PORT/health || exit 1

# 启动应用
CMD ["npm", "start"]