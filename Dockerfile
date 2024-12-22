# 使用Node.js官方镜像作为基础镜像
FROM node:16-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制所有源代码
COPY . .

# 创建数据目录
RUN mkdir -p training_data garbage_data

# 暴露端口
EXPOSE 3000

# 启动命令
CMD ["npm", "start"] 